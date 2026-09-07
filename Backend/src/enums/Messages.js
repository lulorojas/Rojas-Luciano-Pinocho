// Enum de mensajes de la aplicación. Centraliza todos los textos para que
// ningún service ni controller escriba strings de error "a mano": si un
// mensaje cambia, se cambia en un único lugar.

export const Messages = Object.freeze({
    // Disciplina
    DISCIPLINA_NOT_FOUND: "La disciplina no existe.",
    DISCIPLINA_DUPLICATED: "Ya existe una disciplina con ese nombre.",
    NOMBRE_REQUIRED: "El nombre de la disciplina es obligatorio.",
    CUPO_INVALID: "El cupo máximo debe ser un número entero mayor a cero.",
    CUOTA_INVALID: "La cuota mensual debe ser un número mayor a cero.",

    // Genéricos
    INVALID_DATA: "Los datos enviados son inválidos.",
    ROUTE_NOT_FOUND: "El recurso solicitado no existe.",
    INTERNAL_ERROR: "Ocurrió un error inesperado."
});
