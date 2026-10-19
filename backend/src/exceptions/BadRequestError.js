// Error 400: los datos recibidos no cumplen las reglas de validación
// (campo faltante, tipo incorrecto, valor fuera de rango, etc).

import AppError from './AppError.js';

class BadRequestError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

export default BadRequestError;
