// Repository de Inscripcion: único que toca el array en memoria.
// Un lugar queda ocupado mientras la inscripción no esté FINALIZADA ni CANCELADA.

import Inscripcion from '../models/Inscripcion.js';
import { EstadoInscripcion } from '../enums/EstadoInscripcion.js';

let nextId = 1;

const inscripciones = [];

const ESTADOS_QUE_OCUPAN_LUGAR = [
    EstadoInscripcion.PENDIENTE,
    EstadoInscripcion.CONFIRMADA,
    EstadoInscripcion.SUSPENDIDA,
    EstadoInscripcion.BAJA_PENDIENTE
];

function hoy() {
    return new Date().toISOString().slice(0, 10);
}

function crearInscripcionInicial(idSocio, idDisciplina, fechaSolicitud, fechaConfirmacion, estado) {
    inscripciones.push(
        new Inscripcion(nextId++, idSocio, idDisciplina, fechaSolicitud, fechaConfirmacion, null, null, estado)
    );
}

crearInscripcionInicial(1, 2, "2025-02-01", "2025-02-02", EstadoInscripcion.CONFIRMADA);
crearInscripcionInicial(2, 1, "2025-03-15", "2025-03-16", EstadoInscripcion.CONFIRMADA);
crearInscripcionInicial(3, 3, hoy(), null, EstadoInscripcion.PENDIENTE);

export function ocupaLugar(inscripcion) {
    return ESTADOS_QUE_OCUPAN_LUGAR.includes(inscripcion.estado);
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

function existeQueOcupaLugar(idSocio, idDisciplina, idAExcluir = null) {
    return findByDisciplina(idDisciplina).some(
        (inscripcion) =>
            inscripcion.idSocio === idSocio && ocupaLugar(inscripcion) && inscripcion.id !== idAExcluir
    );
}

function create({ idSocio, idDisciplina, fechaSolicitud, fechaConfirmacion, fechaBajaSolicitada, fechaFinEfectiva, estado }) {
    const nuevaInscripcion = new Inscripcion(
        nextId++,
        idSocio,
        idDisciplina,
        fechaSolicitud,
        fechaConfirmacion ?? null,
        fechaBajaSolicitada ?? null,
        fechaFinEfectiva ?? null,
        estado
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
    existeQueOcupaLugar,
    create,
    update,
    remove
};
