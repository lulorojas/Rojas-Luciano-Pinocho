// Utilidades de validación genéricas, sin conocimiento de ninguna entidad
// puntual. Antes estas comprobaciones (es un entero positivo, es un string
// no vacío, cómo se normaliza un nombre para compararlo sin distinguir
// mayúsculas) estaban escritas a mano dentro de DisciplinaService. Se
// extraen acá para no reescribirlas cuando aparezcan Socio, Cuota, etc.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const PERIODO_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

export function isPositiveInteger(value) {
    return Number.isInteger(value) && value > 0;
}

export function isPositiveNumber(value) {
    return typeof value === 'number' && !Number.isNaN(value) && value > 0;
}

export function normalizeForComparison(value) {
    return String(value).trim().toLowerCase();
}

export function isBlank(value) {
    return value === undefined || value === null || String(value).trim() === '';
}

export function isEmail(value) {
    return typeof value === 'string' && EMAIL_REGEX.test(value.trim());
}

export function isHora(value) {
    return typeof value === 'string' && HORA_REGEX.test(value);
}

export function isPeriodo(value) {
    return typeof value === 'string' && PERIODO_REGEX.test(value);
}

export function isFechaIso(value) {
    return typeof value === 'string' && FECHA_REGEX.test(value) && !Number.isNaN(Date.parse(value));
}

export function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

// Los formularios del frontend envían los números como texto ("20"). Se convierten antes de validar
// para que las reglas sigan comparando tipos reales (entero, número positivo).
export function toNumberIfNumeric(value) {
    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return value;
}
