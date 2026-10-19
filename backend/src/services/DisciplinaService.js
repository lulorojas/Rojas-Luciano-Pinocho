// Service: acá viven las reglas de negocio y las validaciones de Disciplina.
// No conoce req/res (eso es del controller) ni toca el array directamente
// (eso es del repository): solo orquesta y decide, y lanza los errores de
// negocio correspondientes.

import DisciplinaRepository from '../repositories/DisciplinaRepository.js';
import InscripcionRepository from '../repositories/InscripcionRepository.js';
import BadRequestError from '../exceptions/BadRequestError.js';
import NotFoundError from '../exceptions/NotFoundError.js';
import ConflictError from '../exceptions/ConflictError.js';
import { Messages } from '../enums/Messages.js';
import {
    isNonEmptyString,
    isPositiveInteger,
    isPositiveNumber,
    normalizeForComparison,
    toNumberIfNumeric
} from '../utils/validators.js';

function validarDatos({ nombre, cupoMaximo, cuotaMensual }) {
    if (!isNonEmptyString(nombre)) {
        throw new BadRequestError(Messages.NOMBRE_REQUIRED);
    }

    if (!isPositiveInteger(cupoMaximo)) {
        throw new BadRequestError(Messages.CUPO_INVALID);
    }

    if (!isPositiveNumber(cuotaMensual)) {
        throw new BadRequestError(Messages.CUOTA_INVALID);
    }
}

// Los formularios envían los números como texto: se convierten antes de validar.
function normalizarDatos(datos = {}) {
    return {
        ...datos,
        cupoMaximo: toNumberIfNumeric(datos.cupoMaximo),
        cuotaMensual: toNumberIfNumeric(datos.cuotaMensual)
    };
}

// La comparación "sin distinguir mayúsculas" es una regla de negocio, así
// que la decisión de qué es duplicado vive acá (no en el repository): el
// repository solo expone los datos crudos vía findAll().
function validarNombreNoDuplicado(nombre, idAExcluir = null) {
    const nombreNormalizado = normalizeForComparison(nombre);
    const existente = DisciplinaRepository.findAll().find(
        (disciplina) =>
            normalizeForComparison(disciplina.nombre) === nombreNormalizado &&
            disciplina.id !== idAExcluir
    );
    if (existente) {
        throw new ConflictError(Messages.DISCIPLINA_DUPLICATED);
    }
}

// Cupo calculado: lo que queda libre según las inscripciones que ocupan lugar.
function conCupo(disciplina) {
    const ocupados = InscripcionRepository.countQueOcupanLugar(disciplina.id);
    return {
        ...disciplina,
        cupoDisponible: Math.max(disciplina.cupoMaximo - ocupados, 0)
    };
}

function getAll() {
    return DisciplinaRepository.findAll().map(conCupo);
}

function getById(id) {
    return conCupo(getEntidad(id));
}

// Devuelve la entidad tal cual está en el repository (sin campos calculados).
function getEntidad(id) {
    const disciplina = DisciplinaRepository.findById(id);
    if (!disciplina) {
        throw new NotFoundError(Messages.DISCIPLINA_NOT_FOUND);
    }
    return disciplina;
}

// Lo que ve quien todavía no inició sesión: solo disciplinas activas y campos comerciales.
function getPublicas() {
    return DisciplinaRepository.findAll()
        .filter((disciplina) => disciplina.activa)
        .map(conCupo)
        .map(({ id, nombre, descripcion, cuotaMensual, cupoDisponible }) => ({
            id,
            nombre,
            descripcion,
            cuotaMensual,
            cupoDisponible
        }));
}

function create(datosCrudos) {
    const datos = normalizarDatos(datosCrudos);
    validarDatos(datos);
    validarNombreNoDuplicado(datos.nombre);
    return conCupo(DisciplinaRepository.create(datos));
}

function update(id, datosCrudos) {
    getEntidad(id);
    const datos = normalizarDatos(datosCrudos);
    validarDatos(datos);
    validarNombreNoDuplicado(datos.nombre, id);
    return conCupo(DisciplinaRepository.update(id, datos));
}

function remove(id) {
    getEntidad(id);
    if (InscripcionRepository.countQueOcupanLugar(id) > 0) {
        throw new ConflictError(Messages.DISCIPLINA_CON_INSCRIPCIONES);
    }
    DisciplinaRepository.remove(id);
}

export default {
    getAll,
    getById,
    getEntidad,
    getPublicas,
    create,
    update,
    remove
};
