const isPrimitive = (value) => ['string', 'number', 'boolean'].includes(typeof value);

/** Texto plano de una celda: lo que devuelve render() si es texto, si no el valor crudo del campo. */
export function cellText(column, row) {
    const raw = row[column.key];
    if (!column.render) return isPrimitive(raw) ? String(raw) : '';
    const rendered = column.render(row);
    if (typeof rendered === 'string' || typeof rendered === 'number') return String(rendered);
    // render devolvió JSX (p. ej. un Badge): el valor crudo sigue siendo buscable
    return isPrimitive(raw) ? String(raw) : '';
}

/**
 * Valor por el que se ordena una columna.
 * sortBy: 'raw' usa el dato sin formatear (fechas ISO, montos, períodos); una función lo calcula.
 * Por defecto se ordena por el texto visible (nombres resueltos desde otras tablas, etc.).
 */
export function sortValue(column, row) {
    if (typeof column.sortBy === 'function') return column.sortBy(row);
    if (column.sortBy === 'raw') return row[column.key] ?? '';
    const text = cellText(column, row);
    return text === '' ? (row[column.key] ?? '') : text;
}

const normalize = (text) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** ¿La fila contiene el texto buscado en alguna de sus columnas visibles? */
export function matchesQuery(columns, row, query) {
    const needle = normalize(query.trim());
    if (!needle) return true;
    return columns.some((column) => normalize(cellText(column, row)).includes(needle));
}
