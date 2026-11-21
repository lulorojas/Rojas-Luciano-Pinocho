// Service de Horario: reglas de negocio y validaciones.

import HorarioRepository from '../repositories/HorarioRepository.js';
import DisciplinaService from './DisciplinaService.js';
import ProfesorService from './ProfesorService.js';
import BadRequestError from '../exceptions/BadRequestError.js';
import NotFoundError from '../exceptions/NotFoundError.js';
import ConflictError from '../exceptions/ConflictError.js';
import { Messages } from '../enums/Messages.js';
import { DIAS_SEMANA } from '../enums/Dias.js';
import { isBlank, isHora } from '../utils/validators.js';
import { rangosSeSuperponen } from '../utils/horarios.js';

function validarDatos({ idDisciplina, idProfesor, diaSemana, horaInicio, horaFin }, idActual = null) {
    if ([idDisciplina, idProfesor, diaSemana, horaInicio, horaFin].some(isBlank)) {
        throw new BadRequestError(Messages.HORARIO_DATOS_REQUIRED);
    }
    // Si la disciplina o el profesor no existen, los services lanzan su propio NotFoundError
    DisciplinaService.getEntidad(idDisciplina);
    ProfesorService.getEntidad(idProfesor);

    if (!DIAS_SEMANA.includes(diaSemana)) {
        throw new BadRequestError(Messages.DIA_INVALID);
    }
    if (!isHora(horaInicio) || !isHora(horaFin)) {
        throw new BadRequestError(Messages.HORA_INVALID);
    }
    if (horaFin <= horaInicio) {
        throw new BadRequestError(Messages.HORA_FIN_INVALID);
    }
    // Un profesor no puede dar dos clases al mismo tiempo
    const profesorOcupado = HorarioRepository.findAll().some(
        (horario) =>
            horario.id !== idActual &&
            horario.idProfesor === idProfesor &&
            horario.diaSemana === diaSemana &&
            rangosSeSuperponen(horario.horaInicio, horario.horaFin, horaInicio, horaFin)
    );
    if (profesorOcupado) {
        throw new ConflictError(Messages.HORARIO_PROFESOR_SUPERPUESTO);
    }
}

function normalizarDatos(datos = {}) {
    return {
        idDisciplina: Number(datos.idDisciplina),
        idProfesor: Number(datos.idProfesor),
        diaSemana: datos.diaSemana,
        horaInicio: datos.horaInicio,
        horaFin: datos.horaFin
    };
}

function getEntidad(id) {
    const horario = HorarioRepository.findById(id);
    if (!horario) {
        throw new NotFoundError(Messages.HORARIO_NOT_FOUND);
    }
    return horario;
}

function getAll() {
    return HorarioRepository.findAll();
}

function getById(id) {
    return getEntidad(id);
}

function create(datosCrudos) {
    const datos = normalizarDatos(datosCrudos);
    validarDatos(datos);
    return HorarioRepository.create(datos);
}

function update(id, datosCrudos) {
    const actual = getEntidad(id);
    const datos = normalizarDatos({ ...actual, ...datosCrudos });
    validarDatos(datos, id);
    return HorarioRepository.update(id, datos);
}

function remove(id) {
    getEntidad(id);
    HorarioRepository.remove(id);
}

export default {
    getAll,
    getById,
    create,
    update,
    remove
};
