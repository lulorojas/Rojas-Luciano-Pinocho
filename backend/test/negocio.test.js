import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { iniciarServidor, detenerServidor, call, login } from './helpers.js';

before(iniciarServidor);
after(detenerServidor);

// Datos de ejemplo: socio 1 Lucía (al día, inscripta en Natación), socio 2 Tomás (con una cuota
// vencida), socio 3 Sofía (cuota pendiente ya vencida por fecha), disciplinas 1 Futsal · 2 Natación ·
// 3 Patín · 4 Gimnasia, profesores 1 Marcela · 3 Laura.
// Natación: lunes y miércoles 18:00-19:00 con la profesora 1.
const ADMIN = 'admin@pinocho.test';
const LUCIA = 'lucia@mail.com';
const TOMAS = 'tomas@mail.com';

const nuevaCuota = (token, idSocio, periodo) =>
    call('/cuotas', {
        method: 'POST',
        token,
        body: { idSocio, periodo, monto: 5000, fechaVencimiento: `${periodo}-28`, estado: 'pendiente' }
    });

describe('pago de cuotas', () => {
    test('el socio paga su cuota: queda pagada, con fecha y medio de pago', async () => {
        const admin = await login(ADMIN);
        const lucia = await login(LUCIA);
        const cuota = (await nuevaCuota(admin.token, 1, '2099-02')).body;

        const pago = await call(`/cuotas/${cuota.id}/pagar`, { method: 'POST', token: lucia.token, body: { medioPago: 'tarjeta' } });
        assert.equal(pago.status, 200);
        assert.equal(pago.body.estado, 'pagada');
        assert.equal(pago.body.medioPago, 'tarjeta');
        assert.ok(pago.body.fechaPago);

        const propias = await call('/cuotas', { token: lucia.token });
        assert.equal(propias.body.find((c) => c.id === cuota.id).estado, 'pagada');
    });

    test('no se paga dos veces, ni con un medio inválido, ni una cuota ajena', async () => {
        const admin = await login(ADMIN);
        const lucia = await login(LUCIA);
        const cuota = (await nuevaCuota(admin.token, 1, '2099-03')).body;

        const invalido = await call(`/cuotas/${cuota.id}/pagar`, { method: 'POST', token: lucia.token, body: { medioPago: 'cheque' } });
        assert.equal(invalido.status, 400);
        const sinMedio = await call(`/cuotas/${cuota.id}/pagar`, { method: 'POST', token: lucia.token, body: {} });
        assert.equal(sinMedio.status, 400);

        assert.equal((await call(`/cuotas/${cuota.id}/pagar`, { method: 'POST', token: lucia.token, body: { medioPago: 'billetera' } })).status, 200);
        const repetido = await call(`/cuotas/${cuota.id}/pagar`, { method: 'POST', token: lucia.token, body: { medioPago: 'billetera' } });
        assert.equal(repetido.status, 409);
        assert.match(repetido.body.message, /ya está pagada/i);

        // La cuota 2 es de Tomás: Lucía recibe 404 y la cuota sigue vencida
        const ajena = await call('/cuotas/2/pagar', { method: 'POST', token: lucia.token, body: { medioPago: 'tarjeta' } });
        assert.equal(ajena.status, 404);
        assert.equal((await call('/cuotas/2', { token: admin.token })).body.estado, 'vencida');
    });

    test('pagar es solo del socio: el admin y quien no inició sesión no pueden', async () => {
        const admin = await login(ADMIN);
        assert.equal((await call('/cuotas/2/pagar', { method: 'POST', token: admin.token, body: { medioPago: 'tarjeta' } })).status, 403);
        assert.equal((await call('/cuotas/2/pagar', { method: 'POST', body: { medioPago: 'tarjeta' } })).status, 401);
    });
});

describe('cuotas', () => {
    test('un socio no puede tener dos cuotas del mismo período', async () => {
        const { token } = await login(ADMIN);
        assert.equal((await nuevaCuota(token, 1, '2099-04')).status, 201);
        const duplicada = await nuevaCuota(token, 1, '2099-04');
        assert.equal(duplicada.status, 409);
        assert.match(duplicada.body.message, /ya tiene una cuota/i);
        // Otro socio sí puede tener cuota de ese período
        assert.equal((await nuevaCuota(token, 2, '2099-04')).status, 201);
    });
});

describe('horarios', () => {
    test('un profesor no puede dar dos clases a la vez, pero sí una a continuación de la otra', async () => {
        const { token } = await login(ADMIN);
        const horario = (horaInicio, horaFin, idProfesor = 1) => call('/horarios', {
            method: 'POST',
            token,
            body: { idDisciplina: 4, idProfesor, diaSemana: 'Lunes', horaInicio, horaFin }
        });

        const pisado = await horario('18:30', '19:30');
        assert.equal(pisado.status, 409);
        assert.match(pisado.body.message, /ya tiene otra clase/i);

        assert.equal((await horario('19:00', '20:00')).status, 201);
        // Otro profesor sí puede dar clase en ese mismo horario
        assert.equal((await horario('18:30', '19:30', 3)).status, 201);
    });

    test('al editar, un horario no choca consigo mismo', async () => {
        const { token } = await login(ADMIN);
        const editado = await call('/horarios/1', { method: 'PUT', token, body: { horaInicio: '18:00' } });
        assert.equal(editado.status, 200);
    });
});

describe('inscripciones: reglas del socio', () => {
    test('un socio con cuotas vencidas no puede inscribirse hasta ponerse al día', async () => {
        const tomas = await login(TOMAS);
        const bloqueado = await call('/inscripciones', { method: 'POST', token: tomas.token, body: { idDisciplina: 3 } });
        assert.equal(bloqueado.status, 409);
        assert.match(bloqueado.body.message, /cuotas vencidas/i);

        assert.equal((await call('/cuotas/2/pagar', { method: 'POST', token: tomas.token, body: { medioPago: 'transferencia' } })).status, 200);
        const inscripto = await call('/inscripciones', { method: 'POST', token: tomas.token, body: { idDisciplina: 3 } });
        assert.equal(inscripto.status, 201);
        assert.equal(inscripto.body.estado, 'SOLICITADA');
    });

    test('un socio de baja no puede inscribirse ni pagar cuotas', async () => {
        const admin = await login(ADMIN);
        const creado = await call('/socios', {
            method: 'POST',
            token: admin.token,
            body: { nombre: 'Bruno', apellido: 'Baja', email: 'bruno@mail.com', password: 'clave-larga-1', estado: 'baja' }
        });
        assert.equal(creado.status, 201);
        const cuota = (await nuevaCuota(admin.token, creado.body.id, '2099-05')).body;

        const bruno = await login('bruno@mail.com', 'clave-larga-1');
        const inscripcion = await call('/inscripciones', { method: 'POST', token: bruno.token, body: { idDisciplina: 4 } });
        assert.equal(inscripcion.status, 400);
        assert.match(inscripcion.body.message, /baja/i);

        const pago = await call(`/cuotas/${cuota.id}/pagar`, { method: 'POST', token: bruno.token, body: { medioPago: 'tarjeta' } });
        assert.equal(pago.status, 400);
        // El historial sigue disponible
        assert.equal((await call('/cuotas', { token: bruno.token })).status, 200);
    });

    test('el admin tampoco puede inscribir a un socio con cuotas vencidas', async () => {
        const { token } = await login(ADMIN);
        const moroso = await call('/inscripciones', { method: 'POST', token, body: { idSocio: 3, idDisciplina: 1 } });
        assert.equal(moroso.status, 409);
    });

    test('se avisa cuando la disciplina se pisa con una en la que el socio ya está inscripto', async () => {
        const admin = await login(ADMIN);
        // Disciplina nueva con clase los miércoles 18:30-19:30: se pisa con Natación (miércoles 18:00-19:00)
        const disciplina = await call('/disciplinas', {
            method: 'POST',
            token: admin.token,
            body: { nombre: 'Yoga', descripcion: '', cupoMaximo: 10, cuotaAparte: 4000, activa: true }
        });
        assert.equal(disciplina.status, 201);
        const horario = await call('/horarios', {
            method: 'POST',
            token: admin.token,
            body: { idDisciplina: disciplina.body.id, idProfesor: 3, diaSemana: 'Miércoles', horaInicio: '18:30', horaFin: '19:30' }
        });
        assert.equal(horario.status, 201);

        const lucia = await login(LUCIA);
        const aviso = await call(`/inscripciones/superposiciones?idDisciplina=${disciplina.body.id}`, { token: lucia.token });
        assert.equal(aviso.status, 200);
        assert.equal(aviso.body.length, 1);
        assert.equal(aviso.body[0].disciplina, 'Natación');
        assert.deepEqual(aviso.body[0].franjas, [{ diaSemana: 'Miércoles', horaInicio: '18:00', horaFin: '19:00' }]);

        // Es solo un aviso: puede inscribirse igual
        assert.equal((await call('/inscripciones', { method: 'POST', token: lucia.token, body: { idDisciplina: disciplina.body.id } })).status, 201);
    });

    test('sin horarios que se pisen no hay aviso; los datos inválidos se rechazan', async () => {
        const lucia = await login(LUCIA);
        const sinAviso = await call('/inscripciones/superposiciones?idDisciplina=1', { token: lucia.token });
        assert.deepEqual(sinAviso.body, []);
        assert.equal((await call('/inscripciones/superposiciones', { token: lucia.token })).status, 400);
        assert.equal((await call('/inscripciones/superposiciones?idDisciplina=999', { token: lucia.token })).status, 404);
        const admin = await login(ADMIN);
        assert.equal((await call('/inscripciones/superposiciones?idDisciplina=1', { token: admin.token })).status, 403);
    });
});
