// Enum de mensajes de la aplicación. Centraliza todos los textos para que
// ningún service ni controller escriba strings de error "a mano": si un
// mensaje cambia, se cambia en un único lugar.

export const Messages = Object.freeze({
    // Disciplina
    DISCIPLINA_NOT_FOUND: "La disciplina no existe.",
    DISCIPLINA_DUPLICATED: "Ya existe una disciplina con ese nombre.",
    DISCIPLINA_INACTIVA: "La disciplina está desactivada.",
    DISCIPLINA_CON_INSCRIPCIONES: "No se puede eliminar una disciplina con inscripciones vigentes.",
    NOMBRE_REQUIRED: "El nombre de la disciplina es obligatorio.",
    CUPO_INVALID: "El cupo máximo debe ser un número entero mayor a cero.",
    CUOTA_INVALID: "La cuota mensual debe ser un número mayor a cero.",

    // Profesor
    PROFESOR_NOT_FOUND: "El profesor no existe.",
    PROFESOR_DATOS_REQUIRED: "El nombre, el apellido y la especialidad del profesor son obligatorios.",
    PROFESOR_CON_HORARIOS: "No se puede eliminar un profesor con horarios asignados.",

    // Horario
    HORARIO_NOT_FOUND: "El horario no existe.",
    HORARIO_DATOS_REQUIRED: "La disciplina, el profesor, el día y las horas son obligatorios.",
    DIA_INVALID: "El día debe ser uno de: Lunes a Domingo.",
    HORA_INVALID: "Las horas deben tener formato HH:MM.",
    HORA_FIN_INVALID: "La hora de fin debe ser posterior a la de inicio.",

    // Socio
    SOCIO_NOT_FOUND: "El socio no existe.",
    SOCIO_DATOS_REQUIRED: "El nombre, el apellido y el email son obligatorios.",
    SOCIO_CON_REGISTROS: "No se puede eliminar un socio con inscripciones o cuotas registradas.",
    ESTADO_SOCIO_INVALID: "El estado del socio no es válido.",
    FECHA_NACIMIENTO_INVALID: "La fecha de nacimiento no es válida.",
    FECHA_NACIMIENTO_FUTURA: "La fecha de nacimiento no puede ser futura.",
    BAJA_CLUB_YA_PEDIDA: "Ya pediste la baja del club.",
    BAJA_CLUB_EN_TRAMITE: "Tenés una baja del club en trámite.",

    // Inscripción
    INSCRIPCION_NOT_FOUND: "La inscripción no existe.",
    INSCRIPCION_DATOS_REQUIRED: "El socio y la disciplina son obligatorios.",
    ESTADO_INSCRIPCION_INVALID: "El estado de la inscripción no es válido.",
    SIN_CUPO: "No hay cupo disponible en esta disciplina.",
    INSCRIPCION_DUPLICADA: "El socio ya está inscripto en esta disciplina.",
    INSCRIPCION_YA_CERRADA: "Esta inscripción ya está finalizada o con una baja en trámite.",

    // Cuota
    CUOTA_NOT_FOUND: "La cuota no existe.",
    CUOTA_DATOS_REQUIRED: "El socio, el período, el monto y el vencimiento son obligatorios.",
    PERIODO_INVALID: "El período debe tener formato AAAA-MM.",
    MONTO_INVALID: "El monto debe ser un número mayor a cero.",
    ESTADO_CUOTA_INVALID: "El estado de la cuota no es válido.",

    // Autenticación y permisos
    LOGIN_INVALID: "Email o contraseña incorrectos.",
    LOGIN_RATE_LIMIT: "Demasiados intentos. Esperá un minuto antes de volver a probar.",
    AUTH_REQUIRED: "Iniciá sesión para continuar.",
    SESSION_INVALID: "Tu sesión venció o no es válida. Iniciá sesión de nuevo.",
    FORBIDDEN: "No tenés permiso para realizar esta acción.",
    EMAIL_INVALID: "El email no es válido.",
    EMAIL_DUPLICATED: "Ya existe una cuenta con ese email.",
    PASSWORD_SHORT: "La contraseña debe tener al menos 8 caracteres.",
    PASSWORD_LONG: "La contraseña es demasiado larga.",
    PASSWORD_REQUIRED: "La contraseña es obligatoria.",

    // Pagos
    PAGOS_NO_DISPONIBLES: "Los pagos online estarán disponibles pronto. Por ahora el club registra tu pago.",

    // Genéricos
    INVALID_DATA: "Los datos enviados son inválidos.",
    ROUTE_NOT_FOUND: "El recurso solicitado no existe.",
    INTERNAL_ERROR: "Ocurrió un error inesperado."
});
