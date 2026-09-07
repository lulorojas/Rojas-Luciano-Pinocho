// Clase base de todos los errores "esperados" de la aplicación (errores de
// negocio, no bugs). Guarda el statusCode HTTP junto con el mensaje para que
// el errorHandler no tenga que adivinar qué código devolver.

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
    }
}

export default AppError;
