// Service de Cuota: reglas de negocio y validaciones. El socio solo puede ver las suyas (lectura);
// el alta, la edición (p. ej. registrar un pago) y la baja son del administrador.

import CuotaRepository from '../repositories/CuotaRepository.js';
import SocioService from './SocioService.js';
import BadRequestError from '../exceptions/BadRequestError.js';
import NotFoundError from '../exceptions/NotFoundError.js';
import { Messages } from '../enums/Messages.js';
import { Roles } from '../enums/Roles.js';
import { EstadoCuota } from '../enums/EstadoCuota.js';
import { isBlank, isPeriodo, isPositiveNumber, toNumberIfNumeric, todayIso } from '../utils/validators.js';

function validarDatos({ idSocio, periodo, monto, fechaVencimiento, estado }) {
    if ([idSocio, periodo, monto, fechaVencimiento].some(isBlank)) {
        throw new BadRequestError(Messages.CUOTA_DATOS_REQUIRED);
    }
    SocioService.getEntidad(idSocio);
    if (!isPeriodo(periodo)) {
        throw new BadRequestError(Messages.PERIODO_INVALID);
    }
    if (!isPositiveNumber(monto)) {
        throw new BadRequestError(Messages.MONTO_INVALID);
    }
    if (!Object.values(EstadoCuota).includes(estado)) {
        throw new BadRequestError(Messages.ESTADO_CUOTA_INVALID);
    }
}

function normalizarDatos(datos = {}) {
    const estado = datos.estado ?? EstadoCuota.PENDIENTE;
    return {
        idSocio: Number(datos.idSocio),
        periodo: datos.periodo,
        monto: toNumberIfNumeric(datos.monto),
        fechaVencimiento: datos.fechaVencimiento,
        // Una cuota pagada siempre tiene fecha de pago; el resto, ninguna
        fechaPago: estado === EstadoCuota.PAGADA ? datos.fechaPago ?? todayIso() : null,
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

function getAll(usuario) {
    if (usuario.rol === Roles.ADMIN) {
        return CuotaRepository.findAll();
    }
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
    validarDatos(datos);
    return CuotaRepository.update(id, datos);
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
    remove
};
