import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { iniciarServidor, detenerServidor, call, login, baseUrl } from './helpers.js';
import { createToken } from '../src/security/tokens.js';
import { DEMO_PASSWORD } from '../src/security/demoPassword.js';

before(iniciarServidor);
after(detenerServidor);

const ADMIN = 'admin@pinocho.test';
const LUCIA = 'lucia@mail.com'; // socio 1

describe('formato de respuesta', () => {
    test('éxito: { success: true, data } · error: { success: false, message }', async () => {
        const ok = await fetch(`${baseUrl()}/public/disciplinas`).then((response) => response.json());
        assert.equal(ok.success, true);
        assert.ok(Array.isArray(ok.data));

        const error = await fetch(`${baseUrl()}/socios`).then((response) => response.json());
        assert.equal(error.success, false);
        assert.equal(typeof error.message, 'string');
    });
});

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

    test('un token de socio con rol cambiado a admin (firmado) no sirve si el id no es de un admin', async () => {
        // sub 2 existe como socio pero NO como administrador: el rol se vuelve a leer del repository
        const confused = createToken({ sub: 2, rol: 'admin' });
        assert.equal((await call('/socios', { token: confused })).status, 401);
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
                rol: 'admin', estado: 'baja', passwordHash: 'x', id: 1
            }
        });
        assert.equal(status, 201);
        assert.equal(body.user.rol, 'socio');
        assert.equal(body.user.estado, 'activo');
        assert.notEqual(body.user.id, 1);

        // Y con ese token no se puede entrar a lo de admin
        assert.equal((await call('/socios', { token: body.token })).status, 403);
    });

    test('rechaza email repetido (409), contraseña corta y email inválido (400)', async () => {
        const datos = { nombre: 'A', apellido: 'B', password: 'unaClaveLarga1' };
        assert.equal((await call('/auth/register', { method: 'POST', body: { ...datos, email: LUCIA } })).status, 409);
        assert.equal((await call('/auth/register', { method: 'POST', body: { ...datos, email: ADMIN } })).status, 409);
        assert.equal((await call('/auth/register', { method: 'POST', body: { ...datos, email: 'otro@mail.com', password: 'corta' } })).status, 400);
        assert.equal((await call('/auth/register', { method: 'POST', body: { ...datos, email: 'no-es-email' } })).status, 400);
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
        assert.equal((await call('/inscripciones/1', { method: 'PUT', token, body: { estado: 'CONFIRMADA' } })).status, 403);
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
        const lucia = await login(LUCIA);
        const { status, body } = await call('/inscripciones', {
            method: 'POST',
            token: lucia.token,
            body: { idSocio: 2, idDisciplina: 4, estado: 'CONFIRMADA', fechaConfirmacion: '2020-01-01' }
        });
        assert.equal(status, 201);
        assert.equal(body.idSocio, lucia.user.id);
        assert.equal(body.estado, 'PENDIENTE');
        assert.equal(body.fechaConfirmacion, null);
    });

    test('no se puede pedir la baja de la inscripción de otro socio', async () => {
        const lucia = await login(LUCIA);
        const admin = await login(ADMIN);
        const todas = await call('/inscripciones', { token: admin.token });
        const ajena = todas.body.find((i) => i.idSocio !== lucia.user.id && ['PENDIENTE', 'CONFIRMADA'].includes(i.estado));
        assert.equal((await call(`/inscripciones/${ajena.id}/solicitar-baja`, { method: 'POST', token: lucia.token })).status, 404);
    });

    test('pedir la baja de una solicitud PENDIENTE la cancela al instante', async () => {
        const lucia = await login(LUCIA);
        const propias = await call('/inscripciones', { token: lucia.token });
        const pendiente = propias.body.find((i) => i.estado === 'PENDIENTE');
        const { status, body } = await call(`/inscripciones/${pendiente.id}/solicitar-baja`, { method: 'POST', token: lucia.token });
        assert.equal(status, 200);
        assert.equal(body.estado, 'CANCELADA');
        assert.equal((await call(`/inscripciones/${pendiente.id}/solicitar-baja`, { method: 'POST', token: lucia.token })).status, 400);
    });

    test('pedir la baja de una inscripción CONFIRMADA queda en BAJA_PENDIENTE hasta que el admin la finaliza', async () => {
        const lucia = await login(LUCIA);
        const confirmada = (await call('/inscripciones', { token: lucia.token })).body.find((i) => i.estado === 'CONFIRMADA');
        const { status, body } = await call(`/inscripciones/${confirmada.id}/solicitar-baja`, { method: 'POST', token: lucia.token });
        assert.equal(status, 200);
        assert.equal(body.estado, 'BAJA_PENDIENTE');
        assert.ok(body.fechaBajaSolicitada);

        const admin = await login(ADMIN);
        const finalizada = await call(`/inscripciones/${confirmada.id}`, { method: 'PUT', token: admin.token, body: { estado: 'FINALIZADA' } });
        assert.equal(finalizada.status, 200);
        assert.equal(finalizada.body.estado, 'FINALIZADA');
        assert.ok(finalizada.body.fechaFinEfectiva);
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
                email: 'otro@mail.com', rol: 'admin', estado: 'baja', passwordHash: 'x'
            }
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
            body: { nombre: 'Baja', apellido: 'Club', email: 'baja.club@mail.com', password: 'unaClaveLarga1' }
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
            body: { nombre: 'Creado', apellido: 'Admin', email: 'creado.admin@mail.com', password: 'claveInicial1', rol: 'admin' }
        });
        assert.equal(creado.status, 201);
        assert.equal(creado.body.rol, 'socio');

        const entra = await call('/auth/login', { method: 'POST', body: { email: 'creado.admin@mail.com', password: 'claveInicial1' } });
        assert.equal(entra.status, 200);
    });

    test('puede confirmar una inscripción y registrar un pago', async () => {
        const { token } = await login(ADMIN);
        assert.equal((await call('/inscripciones/3', { method: 'PUT', token, body: { estado: 'CONFIRMADA' } })).status, 200);
        const pago = await call('/cuotas/2', { method: 'PUT', token, body: { estado: 'pagada' } });
        assert.equal(pago.status, 200);
        assert.ok(pago.body.fechaPago);
    });

    test('las disciplinas aceptan números enviados como texto (formularios) y respetan las reglas de negocio', async () => {
        const { token } = await login(ADMIN);
        const creada = await call('/disciplinas', {
            method: 'POST', token,
            body: { nombre: 'Tenis de mesa', descripcion: '', cupoMaximo: '12', cuotaMensual: '6000', activa: true }
        });
        assert.equal(creada.status, 201);
        assert.equal(creada.body.cupoMaximo, 12);
        assert.equal(creada.body.cupoDisponible, 12);

        const duplicada = await call('/disciplinas', {
            method: 'POST', token, body: { nombre: 'tenis DE mesa', cupoMaximo: 5, cuotaMensual: 100 }
        });
        assert.equal(duplicada.status, 409);

        const invalida = await call('/disciplinas', { method: 'POST', token, body: { nombre: 'x', cupoMaximo: 0, cuotaMensual: 100 } });
        assert.equal(invalida.status, 400);

        // No se elimina una disciplina con inscripciones vigentes
        assert.equal((await call('/disciplinas/1', { method: 'DELETE', token })).status, 409);
        assert.equal((await call(`/disciplinas/${creada.body.id}`, { method: 'DELETE', token })).status, 200);
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

    test('lo que no está en /public sigue exigiendo sesión', async () => {
        assert.equal((await call('/public/socios')).status, 401);
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
            await call('/auth/login', { method: 'POST', body: { email: LUCIA, password: DEMO_PASSWORD } })
        ];
        for (const response of responses) {
            assert.doesNotMatch(response.text, /passwordHash|"password"|scrypt\$/i);
        }
    });
});
