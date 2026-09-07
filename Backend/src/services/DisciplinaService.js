// Service: acá viven las reglas de negocio y las validaciones de Disciplina.
// No conoce req/res (eso es del controller) ni toca el array directamente
// (eso es del repository): solo orquesta y decide, y lanza los errores de
// negocio correspondientes.

import DisciplinaRepository from '../repositories/DisciplinaRepository.js';
import BadRequestError from '../exceptions/BadRequestError.js';
import NotFoundError from '../exceptions/NotFoundError.js';
import ConflictError from '../exceptions/ConflictError.js';
import { Messages } from '../enums/Messages.js';
import {
    isNonEmptyString,
    isPositiveInteger,
    isPositiveNumber,
    normalizeForComparison
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

function getAll() {
    return DisciplinaRepository.findAll();
}

function getById(id) {
    const disciplina = DisciplinaRepository.findById(id);
    if (!disciplina) {
        throw new NotFoundError(Messages.DISCIPLINA_NOT_FOUND);
    }
    return disciplina;
}

function create(datos) {
    validarDatos(datos);
    validarNombreNoDuplicado(datos.nombre);
    return DisciplinaRepository.create(datos);
}

function update(id, datos) {
    getById(id);
    validarDatos(datos);
    validarNombreNoDuplicado(datos.nombre, id);
    return DisciplinaRepository.update(id, datos);
}

function remove(id) {
    getById(id);
    DisciplinaRepository.remove(id);
}

export default {
    getAll,
    getById,
    create,
    update,
    remove
};
