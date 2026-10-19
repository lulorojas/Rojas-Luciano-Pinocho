export class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

export const badRequest = (message) => new HttpError(400, message);
export const unauthorized = (message = 'Iniciá sesión para continuar') => new HttpError(401, message);
export const forbidden = (message = 'No tenés permiso para realizar esta acción') => new HttpError(403, message);
export const notFound = (message) => new HttpError(404, message);
export const tooManyRequests = (message) => new HttpError(429, message);
