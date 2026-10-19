// Error 401: no hay sesión válida (falta el token, está vencido o fue alterado).

import AppError from './AppError.js';

class UnauthorizedError extends AppError {
    constructor(message) {
        super(message, 401);
    }
}

export default UnauthorizedError;
