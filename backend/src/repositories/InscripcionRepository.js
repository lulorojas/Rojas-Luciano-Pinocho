// Repository de Inscripcion: único que toca el array en memoria.
//
// Hay dos nociones distintas de "vigente":
//   - ocupa lugar (cupo): SOLICITADA, ACTIVA, BAJA_PENDIENTE. Una prueba o la lista de espera NO ocupan lugar.
//   - sigue abierta (duplicados): todo menos FINALIZADA y CANCELADA. Mientras una inscripción está abierta
//     (incluso en lista de espera o con la prueba perdida) el socio no puede pedir la misma disciplina de nuevo.

import Inscripcion from '../models/Inscripcion.js';
import { EstadoInscripcion } from '../enums/EstadoInscripcion.js';
import { proximoSabado10, sumarDias } from '../utils/fechas.js';
import { todayIso } from '../utils/validators.js';

let nextId = 1;

const inscripciones = [];

const ESTADOS_QUE_OCUPAN_LUGAR = [
    EstadoInscripcion.SOLICITADA,
    EstadoInscripcion.ACTIVA,
    EstadoInscripcion.BAJA_PENDIENTE
];

const ESTADOS_CERRADOS = [EstadoInscripcion.FINALIZADA, EstadoInscripcion.CANCELADA];

function crearInscripcionInicial(idSocio, idDisciplina, fechaSolicitud, fechaConfirmacion, estado, fechaPrueba = null) {
    inscripciones.push(
        new Inscripcion(nextId++, idSocio, idDisciplina, fechaSolicitud, fechaConfirmacion, null, null, estado, fechaPrueba)
    );
}

const hoy = todayIso();
// Disciplinas: 1 Futsal (prueba) · 2 Natación · 3 Patín (directas)
crearInscripcionInicial(1, 2, "2025-02-03", "2025-02-04", EstadoInscripcion.ACTIVA);
crearInscripcionInicial(2, 1, "2025-03-15", "2025-03-16", EstadoInscripcion.ACTIVA);
crearInscripcionInicial(3, 3, hoy, null, EstadoInscripcion.SOLICITADA);
crearInscripcionInicial(1, 1, sumarDias(hoy, -2), null, EstadoInscripcion.PRUEBA_AGENDADA, proximoSabado10(hoy));
crearInscripcionInicial(1, 3, sumarDias(hoy, -3), null, EstadoInscripcion.SOLICITADA);

export function ocupaLugar(inscripcion) {
    return ESTADOS_QUE_OCUPAN_LUGAR.includes(inscripcion.estado);
}

export function estaAbierta(inscripcion) {
    return !ESTADOS_CERRADOS.includes(inscripcion.estado);
}

function findAll() {
    return inscripciones;
}

function findById(id) {
    return inscripciones.find((inscripcion) => inscripcion.id === id);
}

function findBySocio(idSocio) {
    return inscripciones.filter((inscripcion) => inscripcion.idSocio === idSocio);
}

function findByDisciplina(idDisciplina) {
    return inscripciones.filter((inscripcion) => inscripcion.idDisciplina === idDisciplina);
}

function countQueOcupanLugar(idDisciplina, idAExcluir = null) {
    return findByDisciplina(idDisciplina).filter(
        (inscripcion) => ocupaLugar(inscripcion) && inscripcion.id !== idAExcluir
    ).length;
}

function existeAbierta(idSocio, idDisciplina, idAExcluir = null) {
    return findByDisciplina(idDisciplina).some(
        (inscripcion) =>
            inscripcion.idSocio === idSocio && estaAbierta(inscripcion) && inscripcion.id !== idAExcluir
    );
}

function create({
    idSocio,
    idDisciplina,
    fechaSolicitud,
    fechaConfirmacion,
    fechaBajaSolicitada,
    fechaFinEfectiva,
    estado,
    fechaPrueba,
    nuevo
}) {
    const nuevaInscripcion = new Inscripcion(
        nextId++,
        idSocio,
        idDisciplina,
        fechaSolicitud,
        fechaConfirmacion ?? null,
        fechaBajaSolicitada ?? null,
        fechaFinEfectiva ?? null,
        estado,
        fechaPrueba ?? null,
        nuevo ?? false
    );
    inscripciones.push(nuevaInscripcion);
    return nuevaInscripcion;
}

function update(id, cambios) {
    const inscripcion = findById(id);
    if (!inscripcion) {
        return null;
    }
    Object.assign(inscripcion, cambios);
    return inscripcion;
}

function remove(id) {
    const index = inscripciones.findIndex((inscripcion) => inscripcion.id === id);
    if (index === -1) {
        return false;
    }
    inscripciones.splice(index, 1);
    return true;
}

export default {
    findAll,
    findById,
    findBySocio,
    findByDisciplina,
    countQueOcupanLugar,
    existeAbierta,
    create,
    update,
    remove
};
