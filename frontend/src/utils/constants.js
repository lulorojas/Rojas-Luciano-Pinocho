export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const ESTADOS_SOCIO = ['activo', 'baja'];
export const ESTADOS_INSCRIPCION = ['pendiente', 'confirmada', 'baja'];
export const ESTADOS_CUOTA = ['pendiente', 'pagada', 'vencida'];

// Variante visual del Badge según el estado del registro
export const ESTADO_VARIANT = {
    activo: 'success',
    confirmada: 'success',
    pagada: 'success',
    pendiente: 'warning',
    baja: 'danger',
    vencida: 'danger',
};

export const toOptions = (values) => values.map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }));
