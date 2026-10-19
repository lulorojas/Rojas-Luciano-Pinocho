// Error 501: la funcionalidad existe en la interfaz pero todavía no está disponible (p. ej. pagos online).

import AppError from './AppError.js';

class NotImplementedError extends AppError {
    constructor(message) {
        super(message, 501);
    }
}

export default NotImplementedError;
