// Cuentas con fechas "AAAA-MM-DD" y períodos "AAAA-MM". Se hacen sobre texto + UTC al mediodía para
// que la zona horaria del servidor no corra un día.

import { todayIso } from './validators.js';
import { Club } from '../enums/Club.js';

const aDate = (iso) => new Date(`${iso}T12:00:00Z`);
const aIso = (date) => date.toISOString().slice(0, 10);

export function sumarDias(iso, dias) {
    const date = aDate(iso);
    date.setUTCDate(date.getUTCDate() + dias);
    return aIso(date);
}

export function periodoDe(iso) {
    return iso.slice(0, 7);
}

export function periodoActual() {
    return periodoDe(todayIso());
}

// Período anterior o posterior a uno dado ('2026-01', -1 -> '2025-12')
export function moverPeriodo(periodo, meses) {
    const [anio, mes] = periodo.split('-').map(Number);
    const date = new Date(Date.UTC(anio, mes - 1 + meses, 1, 12));
    return aIso(date).slice(0, 7);
}

// Una cuota recién generada vence el día 10 de su mes, pero nunca antes de DIAS_PARA_VENCER días
// desde hoy: así el socio no se encuentra con una cuota que nació vencida.
export function vencimientoNuevaCuota(periodo, hoy = todayIso()) {
    const dia10 = `${periodo}-10`;
    const minimo = sumarDias(hoy, Club.DIAS_PARA_VENCER);
    return dia10 > minimo ? dia10 : minimo;
}

export function edadEn(fechaNacimiento, hoy = todayIso()) {
    const [anioN, mesN, diaN] = fechaNacimiento.split('-').map(Number);
    const [anio, mes, dia] = hoy.split('-').map(Number);
    let edad = anio - anioN;
    if (mes < mesN || (mes === mesN && dia < diaN)) {
        edad -= 1;
    }
    return edad;
}

// Próximo sábado (al menos 2 días adelante) a las 10:00, en el formato de las fechas de prueba.
export function proximoSabado10(hoy = todayIso()) {
    let fecha = sumarDias(hoy, 2);
    while (aDate(fecha).getUTCDay() !== 6) {
        fecha = sumarDias(fecha, 1);
    }
    return `${fecha}T10:00`;
}
