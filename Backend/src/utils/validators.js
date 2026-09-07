// Utilidades de validación genéricas, sin conocimiento de ninguna entidad
// puntual. Antes estas comprobaciones (es un entero positivo, es un string
// no vacío, cómo se normaliza un nombre para compararlo sin distinguir
// mayúsculas) estaban escritas a mano dentro de DisciplinaService. Se
// extraen acá para no reescribirlas cuando aparezcan Socio, Cuota, etc.

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
