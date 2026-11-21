export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const ESTADOS_SOCIO = ['activo', 'baja'];
// Medios de pago (mismos valores que MediosPago del backend)
export const MEDIOS_PAGO = [
    { id: 'tarjeta', label: 'Tarjeta de crédito o débito', icon: 'card' },
    { id: 'transferencia', label: 'Transferencia bancaria', icon: 'arrow' },
    { id: 'billetera', label: 'Billetera virtual', icon: 'lock' },
];
export const MEDIO_PAGO_LABEL = Object.fromEntries(MEDIOS_PAGO.map((medio) => [medio.id, medio.label]));

export const ESTADOS_CUOTA = ['pendiente', 'pagada', 'vencida'];

// Estados de una inscripción (mismos valores que el enum EstadoInscripcion del backend)
export const ESTADOS_INSCRIPCION = ['PENDIENTE', 'CONFIRMADA', 'SUSPENDIDA', 'BAJA_PENDIENTE', 'FINALIZADA', 'CANCELADA'];

// Inscripciones que ya no ocupan lugar ni se muestran como vigentes
export const ESTADOS_INSCRIPCION_CERRADOS = ['FINALIZADA', 'CANCELADA'];

// Cómo se escribe cada estado en pantalla
export const ESTADO_LABEL = {
    PENDIENTE: 'Pendiente',
    CONFIRMADA: 'Confirmada',
    SUSPENDIDA: 'Suspendida',
    BAJA_PENDIENTE: 'Baja pedida',
    FINALIZADA: 'Finalizada',
    CANCELADA: 'Cancelada',
};

// Variante visual del Badge según el estado del registro
export const ESTADO_VARIANT = {
    activo: 'success',
    pagada: 'success',
    pendiente: 'warning',
    baja: 'danger',
    vencida: 'danger',
    PENDIENTE: 'warning',
    CONFIRMADA: 'success',
    SUSPENDIDA: 'warning',
    BAJA_PENDIENTE: 'warning',
    FINALIZADA: 'neutral',
    CANCELADA: 'neutral',
};

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const toOptions = (values) => values.map((value) => ({ value, label: ESTADO_LABEL[value] ?? capitalize(value) }));
