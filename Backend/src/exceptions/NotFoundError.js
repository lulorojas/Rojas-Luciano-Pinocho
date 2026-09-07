// Error 404: se pidió un recurso (por id, generalmente) que no existe
// en el repository.

import AppError from './AppError.js';

class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
    }
}

export default NotFoundError;
