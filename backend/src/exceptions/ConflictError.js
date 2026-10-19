// Error 409: la operación pedida entra en conflicto con el estado actual
// de los datos (por ejemplo, un nombre que ya existe).

import AppError from './AppError.js';

class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}

export default ConflictError;
