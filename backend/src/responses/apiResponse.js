// Helpers para dar formato uniforme a TODAS las respuestas HTTP de la API.
// Ningún controller ni middleware arma el JSON de respuesta a mano: siempre
// pasan por estas dos funciones, así el formato de éxito/error es idéntico
// en cualquier endpoint.

export function successResponse(res, data, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        data
    });
}

export function errorResponse(res, message, statusCode = 500) {
    return res.status(statusCode).json({
        success: false,
        message
    });
}
