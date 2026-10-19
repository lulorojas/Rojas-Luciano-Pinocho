// Service de Inscripcion: reglas de negocio del ciclo de una inscripción.
//
//   Socio:  solicita (PENDIENTE) → el admin confirma (CONFIRMADA) → entrena.
//   Baja:   si estaba PENDIENTE se cancela al instante (CANCELADA); si estaba CONFIRMADA pasa a
//           BAJA_PENDIENTE y el admin la finaliza (FINALIZADA).
//
// El socio solo puede ver y crear lo propio; el admin puede todo. Esa separación se resuelve acá
// (según el usuario que llega) y no en el controller.

import InscripcionRepository from '../repositories/InscripcionRepository.js';
import DisciplinaService from './DisciplinaService.js';
import SocioService from './SocioService.js';
import BadRequestError from '../exceptions/BadRequestError.js';
import NotFoundError from '../exceptions/NotFoundError.js';
import ConflictError from '../exceptions/ConflictError.js';
import { Messages } from '../enums/Messages.js';
import { Roles } from '../enums/Roles.js';
import { EstadoInscripcion } from '../enums/EstadoInscripcion.js';
import { isBlank, todayIso } from '../utils/validators.js';
import { ocupaLugar } from '../repositories/InscripcionRepository.js';

function validarDatos({ idSocio, idDisciplina, estado }, idActual = null, esAlta = false) {
    if (isBlank(idSocio) || isBlank(idDisciplina)) {
        throw new BadRequestError(Messages.INSCRIPCION_DATOS_REQUIRED);
    }
    // Si el socio o la disciplina no existen, sus services lanzan su propio NotFoundError
    SocioService.getEntidad(idSocio);
    const disciplina = DisciplinaService.getEntidad(idDisciplina);

    if (!Object.values(EstadoInscripcion).includes(estado)) {
        throw new BadRequestError(Messages.ESTADO_INSCRIPCION_INVALID);
    }
    if (esAlta && !disciplina.activa) {
        throw new BadRequestError(Messages.DISCIPLINA_INACTIVA);
    }

    // Solo cuenta contra el cupo (y contra los duplicados) lo que va a ocupar un lugar
    if (ocupaLugar({ estado })) {
        if (InscripcionRepository.countQueOcupanLugar(idDisciplina, idActual) >= disciplina.cupoMaximo) {
            throw new ConflictError(Messages.SIN_CUPO);
        }
        if (InscripcionRepository.existeQueOcupaLugar(idSocio, idDisciplina, idActual)) {
            throw new ConflictError(Messages.INSCRIPCION_DUPLICADA);
        }
    }
}

// Completa las fechas que dependen del estado, conservando las que ya tenía la inscripción.
function construir(datos, actual = null) {
    const estado = datos.estado;
    return {
        idSocio: Number(datos.idSocio),
        idDisciplina: Number(datos.idDisciplina),
        fechaSolicitud: actual?.fechaSolicitud ?? datos.fechaSolicitud ?? todayIso(),
        fechaConfirmacion:
            estado === EstadoInscripcion.CONFIRMADA
                ? actual?.fechaConfirmacion ?? todayIso()
                : actual?.fechaConfirmacion ?? null,
        fechaBajaSolicitada:
            estado === EstadoInscripcion.BAJA_PENDIENTE
                ? actual?.fechaBajaSolicitada ?? todayIso()
                : actual?.fechaBajaSolicitada ?? null,
        fechaFinEfectiva:
            estado === EstadoInscripcion.FINALIZADA || estado === EstadoInscripcion.CANCELADA
                ? actual?.fechaFinEfectiva ?? todayIso()
                : null,
        estado
    };
}

function getEntidad(id) {
    const inscripcion = InscripcionRepository.findById(id);
    if (!inscripcion) {
        throw new NotFoundError(Messages.INSCRIPCION_NOT_FOUND);
    }
    return inscripcion;
}

// El socio recibe 404 (no 403) ante una inscripción ajena: así no se revela qué ids existen.
function getPropia(usuario, id) {
    const inscripcion = getEntidad(id);
    if (inscripcion.idSocio !== usuario.id) {
        throw new NotFoundError(Messages.INSCRIPCION_NOT_FOUND);
    }
    return inscripcion;
}

function getAll(usuario) {
    if (usuario.rol === Roles.ADMIN) {
        return InscripcionRepository.findAll();
    }
    return InscripcionRepository.findBySocio(usuario.id);
}

function getById(id, usuario) {
    return usuario.rol === Roles.ADMIN ? getEntidad(id) : getPropia(usuario, id);
}

// Alta por el administrador (puede fijar el estado).
function create(datos = {}) {
    const completa = { ...datos, estado: datos.estado ?? EstadoInscripcion.PENDIENTE };
    validarDatos(completa, null, true);
    return InscripcionRepository.create(construir(completa));
}

// Solicitud del propio socio: el servidor fija quién es y el estado; lo que mande el cliente se descarta.
function solicitar(usuario, idDisciplina) {
    if (usuario.fechaBajaSolicitada) {
        throw new BadRequestError(Messages.BAJA_CLUB_EN_TRAMITE);
    }
    const datos = { idSocio: usuario.id, idDisciplina, estado: EstadoInscripcion.PENDIENTE };
    validarDatos(datos, null, true);
    return InscripcionRepository.create(construir(datos));
}

function update(id, datos = {}) {
    const actual = getEntidad(id);
    const merged = { ...actual, ...datos };
    validarDatos(merged, id);
    return InscripcionRepository.update(id, construir(merged, actual));
}

function remove(id) {
    getEntidad(id);
    InscripcionRepository.remove(id);
}

function solicitarBaja(usuario, id) {
    const inscripcion = getPropia(usuario, id);
    const { PENDIENTE, CONFIRMADA, SUSPENDIDA, BAJA_PENDIENTE, CANCELADA } = EstadoInscripcion;

    if (inscripcion.estado === PENDIENTE) {
        return InscripcionRepository.update(id, { estado: CANCELADA, fechaFinEfectiva: todayIso() });
    }
    if (inscripcion.estado === CONFIRMADA || inscripcion.estado === SUSPENDIDA) {
        return InscripcionRepository.update(id, { estado: BAJA_PENDIENTE, fechaBajaSolicitada: todayIso() });
    }
    throw new BadRequestError(Messages.INSCRIPCION_YA_CERRADA);
}

export default {
    getAll,
    getById,
    create,
    solicitar,
    update,
    remove,
    solicitarBaja
};
