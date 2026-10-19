// Service de Profesor: reglas de negocio y validaciones.

import ProfesorRepository from '../repositories/ProfesorRepository.js';
import HorarioRepository from '../repositories/HorarioRepository.js';
import BadRequestError from '../exceptions/BadRequestError.js';
import NotFoundError from '../exceptions/NotFoundError.js';
import ConflictError from '../exceptions/ConflictError.js';
import { Messages } from '../enums/Messages.js';
import { isNonEmptyString } from '../utils/validators.js';
import { profesorPara } from '../utils/serializers.js';

function validarDatos({ nombre, apellido, especialidad }) {
    if (!isNonEmptyString(nombre) || !isNonEmptyString(apellido) || !isNonEmptyString(especialidad)) {
        throw new BadRequestError(Messages.PROFESOR_DATOS_REQUIRED);
    }
}

function normalizarDatos(datos = {}) {
    return {
        nombre: String(datos.nombre ?? '').trim(),
        apellido: String(datos.apellido ?? '').trim(),
        telefono: String(datos.telefono ?? '').trim(),
        especialidad: String(datos.especialidad ?? '').trim()
    };
}

function getEntidad(id) {
    const profesor = ProfesorRepository.findById(id);
    if (!profesor) {
        throw new NotFoundError(Messages.PROFESOR_NOT_FOUND);
    }
    return profesor;
}

// `usuario` define qué se ve: los socios no reciben el teléfono.
function getAll(usuario) {
    return ProfesorRepository.findAll().map((profesor) => profesorPara(profesor, usuario));
}

function getById(id, usuario) {
    return profesorPara(getEntidad(id), usuario);
}

function create(datosCrudos) {
    const datos = normalizarDatos(datosCrudos);
    validarDatos(datos);
    return ProfesorRepository.create(datos);
}

function update(id, datosCrudos) {
    getEntidad(id);
    const datos = normalizarDatos(datosCrudos);
    validarDatos(datos);
    return ProfesorRepository.update(id, datos);
}

function remove(id) {
    getEntidad(id);
    const tieneHorarios = HorarioRepository.findAll().some((horario) => horario.idProfesor === id);
    if (tieneHorarios) {
        throw new ConflictError(Messages.PROFESOR_CON_HORARIOS);
    }
    ProfesorRepository.remove(id);
}

export default {
    getAll,
    getById,
    getEntidad,
    create,
    update,
    remove
};
