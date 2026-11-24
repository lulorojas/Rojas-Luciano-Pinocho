import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { iniciarServidor, detenerServidor, call, login } from './helpers.js';

before(iniciarServidor);
after(detenerServidor);

// Datos de ejemplo: Lucía (socio 1) tiene Natación ACTIVA (1), Futsal con prueba agendada (inscripción 4)
// y Patín solicitada (inscripción 5). Disciplinas: 1 Futsal · 2 Natación · 3 Patín · 5 Básquet · 7 Karate.
const ADMIN = 'admin@pinocho.test';
const LUCIA = 'lucia@mail.com';
const TOMAS = 'tomas@mail.com';

describe('inscripciones: disciplinas con prueba', () => {
    test('el socio pide una prueba: el club agenda la fecha y carga el resultado, y el socio recibe avisos', async () => {
        const admin = await login(ADMIN);
        const lucia = await login(LUCIA);

        // Básquet (5) es una disciplina con prueba: no arranca como SOLICITADA
        const pedida = await call('/inscripciones', { method: 'POST', token: lucia.token, body: { idDisciplina: 5 } });
        assert.equal(pedida.status, 201);
        assert.equal(pedida.body.estado, 'PRUEBA_SOLICITADA');
        assert.equal(pedida.body.nuevo, false);

        // No se puede cargar un resultado antes de agendar, ni agendar en el pasado o con formato inválido
        const id = pedida.body.id;
        assert.equal((await call(`/inscripciones/${id}/resultado`, { method: 'POST', token: admin.token, body: { resultado: 'ACTIVA' } })).status, 400);
        assert.equal((await call(`/inscripciones/${id}/agendar-prueba`, { method: 'POST', token: admin.token, body: { fechaPrueba: '2020-01-01T10:00' } })).status, 400);
        assert.equal((await call(`/inscripciones/${id}/agendar-prueba`, { method: 'POST', token: admin.token, body: { fechaPrueba: 'mañana' } })).status, 400);

        const agendada = await call(`/inscripciones/${id}/agendar-prueba`, { method: 'POST', token: admin.token, body: { fechaPrueba: '2099-06-06T10:00' } });
        assert.equal(agendada.status, 200);
        assert.equal(agendada.body.estado, 'PRUEBA_AGENDADA');
        assert.equal(agendada.body.fechaPrueba, '2099-06-06T10:00');

        assert.equal((await call(`/inscripciones/${id}/resultado`, { method: 'POST', token: admin.token, body: { resultado: 'TAL_VEZ' } })).status, 400);
        const espera = await call(`/inscripciones/${id}/resultado`, { method: 'POST', token: admin.token, body: { resultado: 'ESPERA' } });
        assert.equal(espera.body.estado, 'ESPERA');
        assert.equal(espera.body.nuevo, true);

        const avisos = (await call('/avisos', { token: lucia.token })).body;
        assert.ok(avisos.some((a) => /Básquet/.test(a.titulo) && /lista de espera/i.test(a.titulo)));
        assert.ok(avisos.some((a) => /prueba de Básquet ya tiene fecha/i.test(a.titulo)));

        // El socio ve la novedad: deja de ser "nuevo". Mientras está en espera no puede pedir lo mismo de nuevo.
        assert.equal((await call(`/inscripciones/${id}/visto`, { method: 'POST', token: lucia.token })).body.nuevo, false);
        assert.equal((await call('/inscripciones', { method: 'POST', token: lucia.token, body: { idDisciplina: 5 } })).status, 409);

        // Retirarse de la lista de espera cancela la inscripción al instante
        const baja = await call(`/inscripciones/${id}/solicitar-baja`, { method: 'POST', token: lucia.token });
        assert.equal(baja.body.estado, 'CANCELADA');
    });

    test('los estados de prueba no valen en disciplinas directas, y cada rol hace lo suyo', async () => {
        const admin = await login(ADMIN);
        const lucia = await login(LUCIA);
        const invalido = await call('/inscripciones', { method: 'POST', token: admin.token, body: { idSocio: 1, idDisciplina: 7, estado: 'PRUEBA_SOLICITADA' } });
        assert.equal(invalido.status, 400);
        assert.equal((await call('/inscripciones/1/agendar-prueba', { method: 'POST', token: lucia.token, body: {} })).status, 403);
        assert.equal((await call('/inscripciones/1/resultado', { method: 'POST', token: lucia.token, body: {} })).status, 403);
        assert.equal((await call('/inscripciones/1/visto', { method: 'POST', token: admin.token })).status, 403);
        // La inscripción de otro socio no se marca como vista (404)
        assert.equal((await call('/inscripciones/2/visto', { method: 'POST', token: lucia.token })).status, 404);
    });

    test('una prueba que queda se activa, avisa y genera la cuota solo si la disciplina tiene cuota aparte', async () => {
        const admin = await login(ADMIN);
        const lucia = await login(LUCIA);
        // La prueba de Futsal de Lucía estaba agendada: el club informa que quedó
        const quedo = await call('/inscripciones/4/resultado', { method: 'POST', token: admin.token, body: { resultado: 'ACTIVA' } });
        assert.equal(quedo.body.estado, 'ACTIVA');
        assert.equal(quedo.body.nuevo, true);
        assert.ok(quedo.body.fechaConfirmacion);
        const avisos = (await call('/avisos', { token: lucia.token })).body;
        assert.ok(avisos.some((a) => a.titulo === '¡Quedaste en Futsal!'));
        // Futsal está incluida en la cuota social: no genera cuota aparte
        const cuotas = (await call('/cuotas', { token: lucia.token })).body;
        assert.ok(!cuotas.some((c) => c.tipo === 'disciplina' && c.idDisciplina === 1));

        // Patín (3) sí tiene cuota aparte: al confirmarla el club se genera la del mes
        const confirmada = await call('/inscripciones/5', { method: 'PUT', token: admin.token, body: { estado: 'ACTIVA' } });
        assert.equal(confirmada.body.estado, 'ACTIVA');
        const despues = (await call('/cuotas', { token: lucia.token })).body;
        const patin = despues.filter((c) => c.tipo === 'disciplina' && c.idDisciplina === 3);
        assert.equal(patin.length, 1);
        assert.equal(patin[0].monto, 7500);
        assert.equal(patin[0].estado, 'pendiente');
        // Volver a confirmar no duplica la cuota
        await call('/inscripciones/5', { method: 'PUT', token: admin.token, body: { estado: 'ACTIVA' } });
        const otraVez = (await call('/cuotas', { token: lucia.token })).body;
        assert.equal(otraVez.filter((c) => c.tipo === 'disciplina' && c.idDisciplina === 3).length, 1);
    });
});

describe('cuotas: social y por disciplina', () => {
    test('cada socio tiene su cuota social del mes, sin duplicarse al consultar de nuevo', async () => {
        const tomas = await login(TOMAS);
        const primera = (await call('/cuotas', { token: tomas.token })).body;
        const segunda = (await call('/cuotas', { token: tomas.token })).body;
        assert.equal(primera.length, segunda.length);
        assert.ok(primera.some((c) => c.tipo === 'social' && c.periodo === new Date().toISOString().slice(0, 7)));
    });

    test('una cuota de disciplina exige la disciplina, y la social no la lleva', async () => {
        const admin = await login(ADMIN);
        const base = { idSocio: 2, periodo: '2098-01', monto: 5000, fechaVencimiento: '2098-01-10' };
        assert.equal((await call('/cuotas', { method: 'POST', token: admin.token, body: { ...base, tipo: 'disciplina' } })).status, 400);
        assert.equal((await call('/cuotas', { method: 'POST', token: admin.token, body: { ...base, tipo: 'mensual' } })).status, 400);
        const disc = await call('/cuotas', { method: 'POST', token: admin.token, body: { ...base, tipo: 'disciplina', idDisciplina: 2 } });
        assert.equal(disc.status, 201);
        // Mismo período pero otro tipo: no es un duplicado
        const social = await call('/cuotas', { method: 'POST', token: admin.token, body: { ...base, idDisciplina: 2 } });
        assert.equal(social.status, 201);
        assert.equal(social.body.idDisciplina, null);
    });
});

describe('disciplinas: tipo de inscripción y cuota aparte', () => {
    test('el admin define el tipo y la cuota aparte (opcional); se validan', async () => {
        const { token } = await login(ADMIN);
        const ok = await call('/disciplinas', { method: 'POST', token, body: { nombre: 'Ajedrez', cupoMaximo: 10, tipoInscripcion: 'prueba', cuotaAparte: '' } });
        assert.equal(ok.status, 201);
        assert.equal(ok.body.cuotaAparte, null);
        assert.equal(ok.body.tipoInscripcion, 'prueba');
        assert.deepEqual(ok.body.horarios, []);
        assert.equal((await call('/disciplinas', { method: 'POST', token, body: { nombre: 'Otra', cupoMaximo: 10, tipoInscripcion: 'rara' } })).status, 400);
        assert.equal((await call('/disciplinas', { method: 'POST', token, body: { nombre: 'Otra', cupoMaximo: 10, tipoInscripcion: 'directa', cuotaAparte: -5 } })).status, 400);
    });
});
