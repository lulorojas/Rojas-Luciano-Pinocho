// Repository de Cuota: único que toca el array en memoria.

import Cuota from '../models/Cuota.js';
import { EstadoCuota } from '../enums/EstadoCuota.js';
import { TipoCuota } from '../enums/TipoCuota.js';
import { Club } from '../enums/Club.js';
import { moverPeriodo, periodoActual, sumarDias } from '../utils/fechas.js';
import { todayIso } from '../utils/validators.js';

let nextId = 1;

const cuotas = [];

function crearCuotaInicial({ idSocio, tipo = TipoCuota.SOCIAL, idDisciplina = null, periodo, monto, venc, pago = null, estado, medio = null }) {
    cuotas.push(new Cuota(nextId++, idSocio, tipo, idDisciplina, periodo, monto, venc, pago, estado, medio));
}

// Los períodos de la semilla se calculan desde hoy para que el ejemplo siempre tenga sentido:
// Lucía está al día hasta el mes pasado y tiene este mes por pagar; Tomás tiene una cuota vencida
// marcada como tal; Sofía tiene una pendiente cuya fecha ya pasó (también vencida).
const hoy = todayIso();
const actual = periodoActual();
const anterior = moverPeriodo(actual, -1);
const antepenultimo = moverPeriodo(actual, -2);
const venceEsteMes = `${actual}-28` > sumarDias(hoy, 3) ? `${actual}-28` : sumarDias(hoy, 7);

crearCuotaInicial({ idSocio: 1, periodo: anterior, monto: Club.CUOTA_SOCIAL, venc: `${anterior}-10`, pago: `${anterior}-06`, estado: EstadoCuota.PAGADA, medio: 'transferencia' });
crearCuotaInicial({ idSocio: 2, periodo: anterior, monto: Club.CUOTA_SOCIAL, venc: `${anterior}-10`, estado: EstadoCuota.VENCIDA });
crearCuotaInicial({ idSocio: 3, periodo: anterior, monto: Club.CUOTA_SOCIAL, venc: `${anterior}-10`, estado: EstadoCuota.PENDIENTE });
crearCuotaInicial({ idSocio: 1, periodo: antepenultimo, monto: Club.CUOTA_SOCIAL, venc: `${antepenultimo}-10`, pago: `${antepenultimo}-04`, estado: EstadoCuota.PAGADA, medio: 'tarjeta' });
crearCuotaInicial({ idSocio: 1, periodo: actual, monto: Club.CUOTA_SOCIAL, venc: venceEsteMes, estado: EstadoCuota.PENDIENTE });
// Natación (disciplina 2) tiene cuota aparte
crearCuotaInicial({ idSocio: 1, tipo: TipoCuota.DISCIPLINA, idDisciplina: 2, periodo: anterior, monto: 9500, venc: `${anterior}-10`, pago: `${anterior}-06`, estado: EstadoCuota.PAGADA, medio: 'transferencia' });
crearCuotaInicial({ idSocio: 1, tipo: TipoCuota.DISCIPLINA, idDisciplina: 2, periodo: actual, monto: 9500, venc: venceEsteMes, estado: EstadoCuota.PENDIENTE });

function findAll() {
    return cuotas;
}

function findById(id) {
    return cuotas.find((cuota) => cuota.id === id);
}

function findBySocio(idSocio) {
    return cuotas.filter((cuota) => cuota.idSocio === idSocio);
}

// Una cuota se identifica por socio + tipo + disciplina (solo las de disciplina) + período.
function findByClave(idSocio, tipo, idDisciplina, periodo) {
    return cuotas.find(
        (cuota) =>
            cuota.idSocio === idSocio &&
            cuota.tipo === tipo &&
            (cuota.idDisciplina ?? null) === (idDisciplina ?? null) &&
            cuota.periodo === periodo
    );
}

function create({ idSocio, tipo, idDisciplina, periodo, monto, fechaVencimiento, fechaPago, estado, medioPago }) {
    const nuevaCuota = new Cuota(
        nextId++,
        idSocio,
        tipo ?? TipoCuota.SOCIAL,
        idDisciplina ?? null,
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

function update(id, { idSocio, tipo, idDisciplina, periodo, monto, fechaVencimiento, fechaPago, estado, medioPago }) {
    const cuota = findById(id);
    if (!cuota) {
        return null;
    }
    cuota.idSocio = idSocio;
    cuota.tipo = tipo ?? TipoCuota.SOCIAL;
    cuota.idDisciplina = idDisciplina ?? null;
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
    findByClave,
    create,
    update,
    remove
};
