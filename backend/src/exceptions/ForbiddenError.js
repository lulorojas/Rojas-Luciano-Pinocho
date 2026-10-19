// Error 403: la persona está autenticada pero su rol no le permite esta acción.

import AppError from './AppError.js';

class ForbiddenError extends AppError {
    constructor(message) {
        super(message, 403);
    }
}

export default ForbiddenError;
