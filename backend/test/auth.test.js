import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createToken } from '../src/auth/tokens.js';
import { DEMO_PASSWORD } from '../src/store/seedAccounts.js';

let server;
let base;

before(async () => {
    server = createApp().listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    base = `http://localhost:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

async function call(path, { method = 'GET', token, body } = {}) {
    const response = await fetch(`${base}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : null, text };
}

async function login(email, password = DEMO_PASSWORD) {
    const { status, body } = await call('/auth/login', { method: 'POST', body: { email, password } });
    assert.equal(status, 200, `login de ${email} debería funcionar`);
    return body;
}

const ADMIN = 'admin@pinocho.test';
const LUCIA = 'lucia@mail.com'; // socio 1
const TOMAS = 'tomas@mail.com'; // socio 2

describe('autenticación', () => {
    test('rutas protegidas sin token devuelven 401', async () => {
        for (const path of ['/disciplinas', '/socios', '/inscripciones', '/cuotas', '/auth/me', '/socios/me']) {
            const { status } = await call(path);
            assert.equal(status, 401, path);
        }
    });

    test('un token alterado o inventado devuelve 401', async () => {
        const { token } = await login(LUCIA);
        const [payload, signature] = token.split('.');
        const forgedPayload = Buffer.from(JSON.stringify({ sub: 1, rol: 'admin', exp: 9999999999 })).toString('base64url');

        assert.equal((await call('/socios', { token: `${forgedPayload}.${signature}` })).status, 401);
        assert.equal((await call('/socios', { token: `${payload}.firmaFalsa` })).status, 401);
        assert.equal((await call('/socios', { token: 'cualquier-cosa' })).status, 401);
    });

    test('un token vencido devuelve 401', async () => {
        const expired = createToken({ sub: 1, rol: 'socio' }, { ttlSeconds: -10 });
        assert.equal((await call('/disciplinas', { token: expired })).status, 401);
    });

    test('un token firmado para un id inexistente devuelve 401', async () => {
        const ghost = createToken({ sub: 9999, rol: 'socio' });
        assert.equal((await call('/disciplinas', { token: ghost })).status, 401);
    });

    test('login con credenciales incorrectas da el mismo mensaje para email inexistente y contraseña errónea', async () => {
        const wrongPassword = await call('/auth/login', { method: 'POST', body: { email: LUCIA, password: 'incorrecta' } });
        const unknownEmail = await call('/auth/login', { method: 'POST', body: { email: 'nadie@mail.com', password: 'incorrecta' } });
        assert.equal(wrongPassword.status, 401);
        assert.equal(unknownEmail.status, 401);
        assert.equal(wrongPassword.body.message, unknownEmail.body.message);
    });

    test('tras 5 intentos fallidos el login se bloquea con 429', async () => {
        const email = 'bloqueo@mail.com';
        for (let i = 0; i < 5; i += 1) {
            await call('/auth/login', { method: 'POST', body: { email, password: 'x' } });
        }
        const { status } = await call('/auth/login', { method: 'POST', body: { email, password: 'x' } });
        assert.equal(status, 429);
    });
});

describe('registro público', () => {
    test('siempre crea un socio, aunque el body pida otro rol', async () => {
        const { status, body } = await call('/auth/register', {
            method: 'POST',
            body: {
                nombre: 'Nuevo', apellido: 'Socio', email: 'nuevo.rol@mail.com', password: 'unaClaveLarga1',
                rol: 'admin', estado: 'baja', passwordHash: 'x', id: 1,
            },
        });
        assert.equal(status, 201);
        assert.equal(body.user.rol, 'socio');
        assert.equal(body.user.estado, 'activo');
        assert.notEqual(body.user.id, 1);

        // Y con ese token no se puede entrar a lo de admin
        assert.equal((await call('/socios', { token: body.token })).status, 403);
    });

    test('rechaza email repetido, contraseña corta y email inválido', async () => {
        const base = { nombre: 'A', apellido: 'B', password: 'unaClaveLarga1' };
        assert.equal((await call('/auth/register', { method: 'POST', body: { ...base, email: LUCIA } })).status, 400);
        assert.equal((await call('/auth/register', { method: 'POST', body: { ...base, email: 'otro@mail.com', password: 'corta' } })).status, 400);
        assert.equal((await call('/auth/register', { method: 'POST', body: { ...base, email: 'no-es-email' } })).status, 400);
    });
});

describe('roles: el socio no accede a lo del admin', () => {
    test('el socio no puede usar /socios ni escribir en disciplinas, horarios o profesores', async () => {
        const { token } = await login(LUCIA);
        assert.equal((await call('/socios', { token })).status, 403);
        assert.equal((await call('/socios/2', { token })).status, 403);
        assert.equal((await call('/socios', { method: 'POST', token, body: { nombre: 'x' } })).status, 403);
        assert.equal((await call('/disciplinas', { method: 'POST', token, body: { nombre: 'x' } })).status, 403);
        assert.equal((await call('/disciplinas/1', { method: 'DELETE', token })).status, 403);
        assert.equal((await call('/horarios/1', { method: 'PUT', token, body: {} })).status, 403);
        assert.equal((await call('/profesores/1', { method: 'DELETE', token })).status, 403);
    });

    test('el socio puede leer disciplinas con cupo, y los profesores sin teléfono', async () => {
        const { token } = await login(LUCIA);
        const disciplinas = await call('/disciplinas', { token });
        assert.equal(disciplinas.status, 200);
        assert.ok(disciplinas.body.every((d) => typeof d.cupoDisponible === 'number'));
        const profesores = await call('/profesores', { token });
        assert.equal(profesores.status, 200);
        assert.ok(profesores.body.every((p) => !('telefono' in p)));
    });

    test('el socio no puede editar ni borrar inscripciones ni cuotas por la vía del admin', async () => {
        const { token } = await login(LUCIA);
        assert.equal((await call('/inscripciones/1', { method: 'PUT', token, body: { estado: 'confirmada' } })).status, 403);
        assert.equal((await call('/inscripciones/1', { method: 'DELETE', token })).status, 403);
        assert.equal((await call('/cuotas/1', { method: 'PUT', token, body: { estado: 'pagada' } })).status, 403);
        assert.equal((await call('/cuotas', { method: 'POST', token, body: { idSocio: 1, periodo: '2026-01', monto: 1, fechaVencimiento: '2026-01-10' } })).status, 403);
    });

    test('el admin no usa /socios/me (es solo del socio)', async () => {
        const { token } = await login(ADMIN);
        assert.equal((await call('/socios/me', { token })).status, 403);
    });
});

describe('roles: el socio solo ve lo propio', () => {
    test('GET /cuotas e /inscripciones devuelven únicamente lo del socio autenticado', async () => {
        const lucia = await login(LUCIA);
        const cuotas = await call('/cuotas', { token: lucia.token });
        assert.ok(cuotas.body.length > 0);
        assert.ok(cuotas.body.every((c) => c.idSocio === lucia.user.id));

        const inscripciones = await call('/inscripciones', { token: lucia.token });
        assert.ok(inscripciones.body.every((i) => i.idSocio === lucia.user.id));
    });

    test('una cuota ajena responde 404 (sin revelar que existe)', async () => {
        const lucia = await login(LUCIA);
        const todas = await call('/cuotas', { token: (await login(ADMIN)).token });
        const ajena = todas.body.find((c) => c.idSocio !== lucia.user.id);
        assert.ok(ajena, 'la semilla tiene cuotas de otros socios');
        assert.equal((await call(`/cuotas/${ajena.id}`, { token: lucia.token })).status, 404);
    });

    test('al inscribirse, idSocio y estado los fija el servidor', async () => {
        const tomas = await login(TOMAS);
        const { status, body } = await call('/inscripciones', {
            method: 'POST',
            token: tomas.token,
            body: { idSocio: 1, idDisciplina: 4, estado: 'confirmada', fechaConfirmacion: '2020-01-01' },
        });
        assert.equal(status, 201);
        assert.equal(body.idSocio, tomas.user.id);
        assert.equal(body.estado, 'pendiente');
        assert.equal(body.fechaConfirmacion, null);
    });

    test('no se puede pedir la baja de la inscripción de otro socio', async () => {
        const lucia = await login(LUCIA);
        const admin = await login(ADMIN);
        const todas = await call('/inscripciones', { token: admin.token });
        const ajena = todas.body.find((i) => i.idSocio !== lucia.user.id && i.estado !== 'baja');
        assert.equal((await call(`/inscripciones/${ajena.id}/solicitar-baja`, { method: 'POST', token: lucia.token })).status, 404);
    });

    test('el socio puede dar de baja su propia inscripción', async () => {
        const tomas = await login(TOMAS);
        const propias = await call('/inscripciones', { token: tomas.token });
        const vigente = propias.body.find((i) => i.estado === 'pendiente');
        const { status, body } = await call(`/inscripciones/${vigente.id}/solicitar-baja`, { method: 'POST', token: tomas.token });
        assert.equal(status, 200);
        assert.equal(body.estado, 'baja');
    });
});

describe('perfil del socio', () => {
    test('solo se actualizan los campos permitidos', async () => {
        const { token, user } = await login(LUCIA);
        const { status, body } = await call('/socios/me', {
            method: 'PUT',
            token,
            body: {
                nombre: 'Lucía', apellido: 'Martínez', telefono: '3415559999', fechaNacimiento: '1995-03-12',
                email: 'otro@mail.com', rol: 'admin', estado: 'baja', passwordHash: 'x',
            },
        });
        assert.equal(status, 200);
        assert.equal(body.telefono, '3415559999');
        assert.equal(body.email, user.email);
        assert.equal(body.rol, 'socio');
        assert.equal(body.estado, 'activo');
    });

    test('pedir la baja del club la registra y bloquea nuevas inscripciones', async () => {
        const registro = await call('/auth/register', {
            method: 'POST',
            body: { nombre: 'Baja', apellido: 'Club', email: 'baja.club@mail.com', password: 'unaClaveLarga1' },
        });
        const token = registro.body.token;
        assert.equal((await call('/socios/me/baja', { method: 'POST', token })).status, 200);
        assert.equal((await call('/socios/me/baja', { method: 'POST', token })).status, 400);
        assert.equal((await call('/inscripciones', { method: 'POST', token, body: { idDisciplina: 3 } })).status, 400);
    });
});

describe('admin conserva el control total', () => {
    test('puede listar socios, crear con contraseña inicial y ese socio puede iniciar sesión', async () => {
        const { token } = await login(ADMIN);
        assert.equal((await call('/socios', { token })).status, 200);

        const sinPassword = await call('/socios', { method: 'POST', token, body: { nombre: 'A', apellido: 'B', email: 'sinpass@mail.com' } });
        assert.equal(sinPassword.status, 400);

        const creado = await call('/socios', {
            method: 'POST', token,
            body: { nombre: 'Creado', apellido: 'Admin', email: 'creado.admin@mail.com', password: 'claveInicial1', rol: 'admin' },
        });
        assert.equal(creado.status, 201);
        assert.equal(creado.body.rol, 'socio');

        const entra = await call('/auth/login', { method: 'POST', body: { email: 'creado.admin@mail.com', password: 'claveInicial1' } });
        assert.equal(entra.status, 200);
    });

    test('puede confirmar una inscripción y registrar un pago', async () => {
        const { token } = await login(ADMIN);
        assert.equal((await call('/inscripciones/3', { method: 'PUT', token, body: { estado: 'confirmada' } })).status, 200);
        assert.equal((await call('/cuotas/2', { method: 'PUT', token, body: { estado: 'pagada' } })).status, 200);
    });

    test('el pago online responde 501 con un mensaje claro', async () => {
        const { token } = await login(LUCIA);
        const { status, body } = await call('/pagos/intentos', { method: 'POST', token, body: { idCuota: 1 } });
        assert.equal(status, 501);
        assert.match(body.message, /pronto/i);
    });
});

describe('datos públicos', () => {
    test('/public/disciplinas no requiere sesión y solo expone campos comerciales de las activas', async () => {
        const { status, body } = await call('/public/disciplinas');
        assert.equal(status, 200);
        assert.ok(body.length > 0);
        for (const item of body) {
            assert.deepEqual(Object.keys(item).sort(), ['cuotaMensual', 'cupoDisponible', 'descripcion', 'id', 'nombre']);
        }
    });

    test('el resto de /public no existe', async () => {
        assert.equal((await call('/public/socios')).status, 404);
    });
});

describe('no se filtran contraseñas', () => {
    test('ninguna respuesta contiene password ni passwordHash', async () => {
        const admin = await login(ADMIN);
        const lucia = await login(LUCIA);
        const responses = [
            await call('/socios', { token: admin.token }),
            await call('/socios/1', { token: admin.token }),
            await call('/auth/me', { token: admin.token }),
            await call('/auth/me', { token: lucia.token }),
            await call('/socios/me', { token: lucia.token }),
            await call('/auth/login', { method: 'POST', body: { email: LUCIA, password: DEMO_PASSWORD } }),
        ];
        for (const response of responses) {
            assert.doesNotMatch(response.text, /passwordHash|"password"|scrypt\$/i);
        }
    });
});
