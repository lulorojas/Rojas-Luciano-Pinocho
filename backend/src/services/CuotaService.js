// Service de Cuota: reglas de negocio y validaciones. El socio solo puede ver las suyas (lectura);
// el alta, la edición (p. ej. registrar un pago) y la baja son del administrador.
//
// Hay dos tipos de cuota: la SOCIAL (por ser socio, todos los meses) y la de DISCIPLINA (solo para las
// disciplinas con cuota aparte, mientras la inscripción está activa). Se generan solas:
//   - la social, al darse de alta y una vez por mes;
//   - la de disciplina, cuando la inscripción pasa a ACTIVA y una vez por mes.
// La generación mensual es "perezosa": ocurre la primera vez que el socio consulta sus cuotas en el mes.

import CuotaRepository from '../repositories/CuotaRepository.js';
import InscripcionRepository from '../repositories/InscripcionRepository.js';
import DisciplinaRepository from '../repositories/DisciplinaRepository.js';
import SocioService from './SocioService.js';
import DisciplinaService from './DisciplinaService.js';
import BadRequestError from '../exceptions/BadRequestError.js';
import NotFoundError from '../exceptions/NotFoundError.js';
import ConflictError from '../exceptions/ConflictError.js';
import { Messages } from '../enums/Messages.js';
import { Roles } from '../enums/Roles.js';
import { Club } from '../enums/Club.js';
import { EstadoCuota } from '../enums/EstadoCuota.js';
import { EstadoSocio } from '../enums/EstadoSocio.js';
import { EstadoInscripcion } from '../enums/EstadoInscripcion.js';
import { MediosPago } from '../enums/MediosPago.js';
import { TipoCuota } from '../enums/TipoCuota.js';
import { periodoActual, periodoDe, vencimientoNuevaCuota } from '../utils/fechas.js';
import { isBlank, isPeriodo, isPositiveNumber, toNumberIfNumeric, todayIso } from '../utils/validators.js';

function validarDatos({ idSocio, tipo, idDisciplina, periodo, monto, fechaVencimiento, estado }, idActual = null) {
    if ([idSocio, periodo, monto, fechaVencimiento].some(isBlank)) {
        throw new BadRequestError(Messages.CUOTA_DATOS_REQUIRED);
    }
    SocioService.getEntidad(idSocio);
    if (!Object.values(TipoCuota).includes(tipo)) {
        throw new BadRequestError(Messages.TIPO_CUOTA_INVALID);
    }
    if (tipo === TipoCuota.DISCIPLINA) {
        if (isBlank(idDisciplina)) {
            throw new BadRequestError(Messages.CUOTA_DISCIPLINA_REQUIRED);
        }
        DisciplinaService.getEntidad(idDisciplina);
    }
    if (!isPeriodo(periodo)) {
        throw new BadRequestError(Messages.PERIODO_INVALID);
    }
    if (!isPositiveNumber(monto)) {
        throw new BadRequestError(Messages.MONTO_INVALID);
    }
    if (!Object.values(EstadoCuota).includes(estado)) {
        throw new BadRequestError(Messages.ESTADO_CUOTA_INVALID);
    }
    // Un socio tiene una sola cuota por período, tipo y disciplina
    const existente = CuotaRepository.findByClave(idSocio, tipo, idDisciplina, periodo);
    if (existente && existente.id !== idActual) {
        throw new ConflictError(Messages.CUOTA_DUPLICADA);
    }
}

function normalizarDatos(datos = {}) {
    const estado = datos.estado ?? EstadoCuota.PENDIENTE;
    const tipo = datos.tipo ?? TipoCuota.SOCIAL;
    return {
        idSocio: Number(datos.idSocio),
        tipo,
        // La cuota social no pertenece a ninguna disciplina
        idDisciplina: tipo === TipoCuota.DISCIPLINA && !isBlank(datos.idDisciplina) ? Number(datos.idDisciplina) : null,
        periodo: datos.periodo,
        monto: toNumberIfNumeric(datos.monto),
        fechaVencimiento: datos.fechaVencimiento,
        // Una cuota pagada siempre tiene fecha de pago; el resto, ninguna
        fechaPago: estado === EstadoCuota.PAGADA ? datos.fechaPago ?? todayIso() : null,
        // El medio de pago solo tiene sentido en una cuota pagada
        medioPago: estado === EstadoCuota.PAGADA ? datos.medioPago ?? null : null,
        estado
    };
}

function getEntidad(id) {
    const cuota = CuotaRepository.findById(id);
    if (!cuota) {
        throw new NotFoundError(Messages.CUOTA_NOT_FOUND);
    }
    return cuota;
}

// ---- Generación automática ----

function generarCuotaSocial(idSocio, periodo = periodoActual()) {
    if (CuotaRepository.findByClave(idSocio, TipoCuota.SOCIAL, null, periodo)) {
        return null;
    }
    return CuotaRepository.create({
        idSocio,
        tipo: TipoCuota.SOCIAL,
        idDisciplina: null,
        periodo,
        monto: Club.CUOTA_SOCIAL,
        fechaVencimiento: vencimientoNuevaCuota(periodo),
        estado: EstadoCuota.PENDIENTE
    });
}

// Solo las disciplinas con cuota aparte generan cuota propia.
function generarCuotaDisciplina(idSocio, disciplina, periodo = periodoActual()) {
    if (!disciplina?.cuotaAparte) {
        return null;
    }
    if (CuotaRepository.findByClave(idSocio, TipoCuota.DISCIPLINA, disciplina.id, periodo)) {
        return null;
    }
    return CuotaRepository.create({
        idSocio,
        tipo: TipoCuota.DISCIPLINA,
        idDisciplina: disciplina.id,
        periodo,
        monto: disciplina.cuotaAparte,
        fechaVencimiento: vencimientoNuevaCuota(periodo),
        estado: EstadoCuota.PENDIENTE
    });
}

// Completa lo que falta del mes en curso. Un socio de baja o con la baja del club pedida no genera cuotas nuevas.
function asegurarCuotasDelMes(socio) {
    if (socio.estado === EstadoSocio.BAJA || socio.fechaBajaSolicitada) {
        return;
    }
    const periodo = periodoActual();
    if (periodoDe(socio.fechaAlta) <= periodo) {
        generarCuotaSocial(socio.id, periodo);
    }
    for (const inscripcion of InscripcionRepository.findBySocio(socio.id)) {
        const activa =
            inscripcion.estado === EstadoInscripcion.ACTIVA || inscripcion.estado === EstadoInscripcion.BAJA_PENDIENTE;
        if (activa) {
            generarCuotaDisciplina(socio.id, DisciplinaRepository.findById(inscripcion.idDisciplina), periodo);
        }
    }
}

// ---- Lectura y escritura ----

function getAll(usuario) {
    if (usuario.rol === Roles.ADMIN) {
        return CuotaRepository.findAll();
    }
    asegurarCuotasDelMes(usuario);
    return CuotaRepository.findBySocio(usuario.id);
}

// El socio recibe 404 (no 403) ante una cuota ajena: así no se revela qué ids existen.
function getById(id, usuario) {
    const cuota = getEntidad(id);
    if (usuario.rol !== Roles.ADMIN && cuota.idSocio !== usuario.id) {
        throw new NotFoundError(Messages.CUOTA_NOT_FOUND);
    }
    return cuota;
}

function create(datosCrudos) {
    const datos = normalizarDatos(datosCrudos);
    validarDatos(datos);
    return CuotaRepository.create(datos);
}

function update(id, datosCrudos) {
    const actual = getEntidad(id);
    const datos = normalizarDatos({ ...actual, ...datosCrudos });
    validarDatos(datos, id);
    return CuotaRepository.update(id, datos);
}

// Una cuota está vencida si el administrador la marcó así o si no se pagó y ya pasó su fecha.
function estaVencida(cuota) {
    if (cuota.estado === EstadoCuota.PAGADA) {
        return false;
    }
    return cuota.estado === EstadoCuota.VENCIDA || cuota.fechaVencimiento < todayIso();
}

function tieneCuotasVencidas(idSocio) {
    return CuotaRepository.findBySocio(idSocio).some(estaVencida);
}

// Pago de una cuota por el propio socio. El servidor decide el estado, la fecha y el importe
// (que ya está en la cuota): del cliente solo se acepta el medio de pago.
function pagar(usuario, id, { medioPago } = {}) {
    if (usuario.estado === EstadoSocio.BAJA) {
        throw new BadRequestError(Messages.SOCIO_DE_BAJA);
    }
    const cuota = getById(id, usuario);
    if (cuota.estado === EstadoCuota.PAGADA) {
        throw new ConflictError(Messages.CUOTA_YA_PAGADA);
    }
    if (!Object.values(MediosPago).includes(medioPago)) {
        throw new BadRequestError(Messages.MEDIO_PAGO_INVALID);
    }
    return CuotaRepository.update(id, {
        ...cuota,
        estado: EstadoCuota.PAGADA,
        fechaPago: todayIso(),
        medioPago
    });
}

function remove(id) {
    getEntidad(id);
    CuotaRepository.remove(id);
}

export default {
    getAll,
    getById,
    create,
    update,
    remove,
    pagar,
    tieneCuotasVencidas,
    generarCuotaSocial,
    generarCuotaDisciplina
};
