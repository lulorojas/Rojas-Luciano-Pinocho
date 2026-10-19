// Manejo centralizado de errores. notFoundHandler atrapa cualquier ruta
// que no matcheó ningún router. errorHandler es el middleware de 4
// parámetros que Express reconoce como manejador de errores: si es un
// AppError conocido responde con su statusCode y mensaje, y si es
// cualquier otra cosa (un bug no previsto) responde 500 sin filtrar
// detalles internos al cliente.

import AppError from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';
import { errorResponse } from '../responses/apiResponse.js';

export function notFoundHandler(req, res) {
    return errorResponse(res, Messages.ROUTE_NOT_FOUND, 404);
}

export function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return errorResponse(res, err.message, err.statusCode);
    }

    console.error(err);
    return errorResponse(res, Messages.INTERNAL_ERROR, 500);
}
