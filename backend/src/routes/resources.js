import { createCrudRouter } from './createCrudRouter.js';
import { store } from '../store/memoryStore.js';
import { badRequest } from '../utils/httpError.js';
import { hashPassword } from '../auth/passwords.js';
import { findUserByEmail, publicUser } from '../auth/users.js';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const ESTADOS_SOCIO = ['activo', 'baja'];
const ESTADOS_INSCRIPCION = ['pendiente', 'confirmada', 'baja'];
const ESTADOS_CUOTA = ['pendiente', 'pagada', 'vencida'];

export const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

export function requireFields(data, fields) {
    for (const [key, label] of Object.entries(fields)) {
        if (isBlank(data[key])) throw badRequest(`${label} es obligatorio`);
    }
}

function requirePositive(value, label) {
    if (!(Number(value) > 0)) throw badRequest(`${label} debe ser un número mayor a 0`);
}

function requireOneOf(value, options, label) {
    if (!options.includes(value)) throw badRequest(`${label} debe ser uno de: ${options.join(', ')}`);
}

function requireExisting(collection, id, label) {
    if (!store[collection].items.some((item) => item.id === Number(id))) {
        throw badRequest(`${label} inexistente`);
    }
}

export const today = () => new Date().toISOString().slice(0, 10);

// Cupo calculado: las inscripciones vigentes (no dadas de baja) ocupan lugar, incluso las pendientes
export const inscriptosDe = (idDisciplina) => store.inscripciones.items.filter(
    (ins) => ins.idDisciplina === idDisciplina && ins.estado !== 'baja',
).length;

export const disciplinasRouter = createCrudRouter({
    collection: 'disciplinas',
    label: 'Disciplina',
    serialize: (item) => ({ ...item, cupoDisponible: Math.max(item.cupoMaximo - inscriptosDe(item.id), 0) }),
    validate(data) {
        requireFields(data, { nombre: 'El nombre', cupoMaximo: 'El cupo máximo', cuotaMensual: 'La cuota mensual' });
        requirePositive(data.cupoMaximo, 'El cupo máximo');
        requirePositive(data.cuotaMensual, 'La cuota mensual');
    },
    build(data, id) {
        const activa = data.activa !== false && data.activa !== 'false';
        return {
            id,
            nombre: String(data.nombre).trim(),
            descripcion: data.descripcion ?? '',
            cupoMaximo: Number(data.cupoMaximo),
            cuotaMensual: Number(data.cuotaMensual),
            activa,
            fechaDesactivacion: activa ? null : (data.fechaDesactivacion ?? today()),
        };
    },
    beforeDelete(item) {
        const enUso = store.inscripciones.items.some(
            (ins) => ins.idDisciplina === item.id && ins.estado !== 'baja',
        );
        if (enUso) throw badRequest('No se puede eliminar una disciplina con inscripciones vigentes');
    },
});

export const sociosRouter = createCrudRouter({
    collection: 'socios',
    label: 'Socio',
    serialize: (item) => publicUser(item),
    validate(data, current) {
        requireFields(data, { nombre: 'El nombre', apellido: 'El apellido', email: 'El email' });
        if (!EMAIL_REGEX.test(data.email)) throw badRequest('El email no es válido');
        const existente = findUserByEmail(data.email);
        if (existente && !(existente.rol === 'socio' && existente.id === current?.id)) {
            throw badRequest('Ya existe una cuenta con ese email');
        }
        if (data.estado) requireOneOf(data.estado, ESTADOS_SOCIO, 'El estado');
        // Al crear, el admin define una contraseña inicial; al editar es opcional (si viene, la reemplaza)
        if (!current && isBlank(data.password)) throw badRequest('La contraseña inicial es obligatoria');
        if (!isBlank(data.password) && String(data.password).length < 8) {
            throw badRequest('La contraseña debe tener al menos 8 caracteres');
        }
    },
    build(data, id) {
        const numeroSocio = data.numeroSocio ?? 1000 + id;
        return {
            id,
            // El rol no sale nunca del body: toda cuenta de esta colección es de socio
            rol: 'socio',
            passwordHash: isBlank(data.password) ? data.passwordHash : hashPassword(String(data.password)),
            nombre: String(data.nombre).trim(),
            apellido: String(data.apellido).trim(),
            email: String(data.email).trim(),
            telefono: data.telefono ?? '',
            numeroSocio,
            fechaNacimiento: data.fechaNacimiento ?? '',
            fechaAlta: data.fechaAlta ?? today(),
            fechaBajaSolicitada: data.fechaBajaSolicitada ?? null,
            estado: data.estado ?? 'activo',
        };
    },
    beforeDelete(item) {
        const enUso = store.inscripciones.items.some((ins) => ins.idSocio === item.id)
            || store.cuotas.items.some((cuota) => cuota.idSocio === item.id);
        if (enUso) throw badRequest('No se puede eliminar un socio con inscripciones o cuotas registradas');
    },
});

export const profesoresRouter = createCrudRouter({
    collection: 'profesores',
    label: 'Profesor',
    // El teléfono del profesor es dato interno: los socios no lo reciben
    serialize: (item, req) => {
        if (req?.user?.rol === 'admin') return item;
        const { telefono, ...publico } = item;
        return publico;
    },
    validate(data) {
        requireFields(data, { nombre: 'El nombre', apellido: 'El apellido', especialidad: 'La especialidad' });
    },
    build(data, id) {
        return {
            id,
            nombre: String(data.nombre).trim(),
            apellido: String(data.apellido).trim(),
            telefono: data.telefono ?? '',
            especialidad: String(data.especialidad).trim(),
        };
    },
    beforeDelete(item) {
        const enUso = store.horarios.items.some((horario) => horario.idProfesor === item.id);
        if (enUso) throw badRequest('No se puede eliminar un profesor con horarios asignados');
    },
});

export const horariosRouter = createCrudRouter({
    collection: 'horarios',
    label: 'Horario',
    validate(data) {
        requireFields(data, {
            idDisciplina: 'La disciplina',
            idProfesor: 'El profesor',
            diaSemana: 'El día',
            horaInicio: 'La hora de inicio',
            horaFin: 'La hora de fin',
        });
        requireExisting('disciplinas', data.idDisciplina, 'Disciplina');
        requireExisting('profesores', data.idProfesor, 'Profesor');
        requireOneOf(data.diaSemana, DIAS, 'El día');
        if (!HORA_REGEX.test(data.horaInicio) || !HORA_REGEX.test(data.horaFin)) {
            throw badRequest('Las horas deben tener formato HH:MM');
        }
        if (data.horaFin <= data.horaInicio) throw badRequest('La hora de fin debe ser posterior a la de inicio');
    },
    build(data, id) {
        return {
            id,
            idDisciplina: Number(data.idDisciplina),
            idProfesor: Number(data.idProfesor),
            diaSemana: data.diaSemana,
            horaInicio: data.horaInicio,
            horaFin: data.horaFin,
        };
    },
});

export const inscripcionRules = {
    validate(data, current) {
        requireFields(data, { idSocio: 'El socio', idDisciplina: 'La disciplina' });
        requireExisting('socios', data.idSocio, 'Socio');
        requireExisting('disciplinas', data.idDisciplina, 'Disciplina');
        if (data.estado) requireOneOf(data.estado, ESTADOS_INSCRIPCION, 'El estado');

        const disciplina = store.disciplinas.items.find((d) => d.id === Number(data.idDisciplina));
        const vigentes = store.inscripciones.items.filter(
            (ins) => ins.idDisciplina === disciplina.id && ins.estado !== 'baja' && ins.id !== current?.id,
        );
        const quedaVigente = (data.estado ?? current?.estado ?? 'pendiente') !== 'baja';
        if (!disciplina.activa && !current) throw badRequest('La disciplina está desactivada');
        if (quedaVigente && vigentes.length >= disciplina.cupoMaximo) {
            throw badRequest(`No hay cupo disponible en ${disciplina.nombre}`);
        }
        const repetida = vigentes.some((ins) => ins.idSocio === Number(data.idSocio));
        if (quedaVigente && repetida) throw badRequest('El socio ya está inscripto en esta disciplina');
    },
    build(data, id) {
        const estado = data.estado ?? 'pendiente';
        return {
            id,
            idSocio: Number(data.idSocio),
            idDisciplina: Number(data.idDisciplina),
            fechaSolicitud: data.fechaSolicitud ?? today(),
            fechaConfirmacion: estado === 'confirmada' ? (data.fechaConfirmacion ?? today()) : (data.fechaConfirmacion ?? null),
            fechaBajaSolicitada: data.fechaBajaSolicitada ?? null,
            fechaFinEfectiva: estado === 'baja' ? (data.fechaFinEfectiva ?? today()) : (data.fechaFinEfectiva ?? null),
            estado,
        };
    },
};

export const inscripcionesRouter = createCrudRouter({
    collection: 'inscripciones',
    label: 'Inscripción',
    ...inscripcionRules,
});

export const cuotasRouter = createCrudRouter({
    collection: 'cuotas',
    label: 'Cuota',
    validate(data) {
        requireFields(data, { idSocio: 'El socio', periodo: 'El período', monto: 'El monto', fechaVencimiento: 'El vencimiento' });
        requireExisting('socios', data.idSocio, 'Socio');
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(data.periodo)) throw badRequest('El período debe tener formato AAAA-MM');
        requirePositive(data.monto, 'El monto');
        if (data.estado) requireOneOf(data.estado, ESTADOS_CUOTA, 'El estado');
    },
    build(data, id) {
        const estado = data.estado ?? 'pendiente';
        return {
            id,
            idSocio: Number(data.idSocio),
            periodo: data.periodo,
            monto: Number(data.monto),
            fechaVencimiento: data.fechaVencimiento,
            fechaPago: estado === 'pagada' ? (data.fechaPago ?? today()) : null,
            estado,
        };
    },
});
