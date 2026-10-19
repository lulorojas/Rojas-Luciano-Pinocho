// Las fechas llegan como "AAAA-MM-DD"; se formatean sin pasar por Date para evitar desfases de zona horaria.
export function formatDate(value) {
    if (!value) return '—';
    const [year, month, day] = String(value).slice(0, 10).split('-');
    return `${day}/${month}/${year}`;
}

export function formatPeriod(value) {
    if (!value) return '—';
    const [year, month] = value.split('-');
    return `${month}/${year}`;
}

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export function formatCurrency(value) {
    return currency.format(Number(value) || 0);
}

export function fullName(person) {
    return person ? `${person.nombre} ${person.apellido}` : '—';
}

const monthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' });

/** '2025-10' -> 'Octubre 2025' */
export function formatPeriodLong(value) {
    if (!value) return '—';
    const [year, month] = value.split('-').map(Number);
    const text = monthFormatter.format(new Date(year, month - 1, 1));
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function initials(person) {
    if (!person) return '?';
    return `${person.nombre?.[0] ?? ''}${person.apellido?.[0] ?? ''}`.toUpperCase();
}
