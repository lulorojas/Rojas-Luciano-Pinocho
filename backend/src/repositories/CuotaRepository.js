// Repository de Cuota: único que toca el array en memoria.

import Cuota from '../models/Cuota.js';
import { EstadoCuota } from '../enums/EstadoCuota.js';

let nextId = 1;

const cuotas = [];

function crearCuotaInicial(idSocio, periodo, monto, fechaVencimiento, fechaPago, estado) {
    cuotas.push(new Cuota(nextId++, idSocio, periodo, monto, fechaVencimiento, fechaPago, estado));
}

crearCuotaInicial(1, "2025-10", 9500, "2025-10-10", "2025-10-05", EstadoCuota.PAGADA);
crearCuotaInicial(2, "2025-10", 8000, "2025-10-10", null, EstadoCuota.VENCIDA);
crearCuotaInicial(3, "2025-11", 7500, "2025-11-10", null, EstadoCuota.PENDIENTE);

function findAll() {
    return cuotas;
}

function findById(id) {
    return cuotas.find((cuota) => cuota.id === id);
}

function findBySocio(idSocio) {
    return cuotas.filter((cuota) => cuota.idSocio === idSocio);
}

function create({ idSocio, periodo, monto, fechaVencimiento, fechaPago, estado, medioPago }) {
    const nuevaCuota = new Cuota(
        nextId++,
        idSocio,
        periodo,
        monto,
        fechaVencimiento,
        fechaPago ?? null,
        estado,
        medioPago ?? null
    );
    cuotas.push(nuevaCuota);
    return nuevaCuota;
}

function update(id, { idSocio, periodo, monto, fechaVencimiento, fechaPago, estado, medioPago }) {
    const cuota = findById(id);
    if (!cuota) {
        return null;
    }
    cuota.idSocio = idSocio;
    cuota.periodo = periodo;
    cuota.monto = monto;
    cuota.fechaVencimiento = fechaVencimiento;
    cuota.fechaPago = fechaPago ?? null;
    cuota.estado = estado;
    cuota.medioPago = medioPago ?? null;
    return cuota;
}

function remove(id) {
    const index = cuotas.findIndex((cuota) => cuota.id === id);
    if (index === -1) {
        return false;
    }
    cuotas.splice(index, 1);
    return true;
}

export default {
    findAll,
    findById,
    findBySocio,
    create,
    update,
    remove
};
