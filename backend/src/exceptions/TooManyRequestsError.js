// Error 429: demasiados intentos en poco tiempo (se usa para frenar la fuerza bruta en el login).

import AppError from './AppError.js';

class TooManyRequestsError extends AppError {
    constructor(message) {
        super(message, 429);
    }
}

export default TooManyRequestsError;
