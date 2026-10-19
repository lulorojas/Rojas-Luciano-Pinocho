// Middlewares de autenticación y autorización. Son la garantía real de los roles: aunque la interfaz
// oculte botones, el servidor responde 401/403 a quien no corresponde.
//   requireAuth      -> exige una sesión válida y deja el usuario en req.user.
//   requireRole(...) -> exige que req.user tenga alguno de los roles indicados.
// Los errores se lanzan sin try/catch: Express 5 los reenvía al errorHandler.

import AuthService from '../services/AuthService.js';
import UnauthorizedError from '../exceptions/UnauthorizedError.js';
import ForbiddenError from '../exceptions/ForbiddenError.js';
import { Messages } from '../enums/Messages.js';

export function requireAuth(req, res, next) {
    const [esquema, token] = (req.headers.authorization ?? '').split(' ');
    if (esquema !== 'Bearer' || !token) {
        throw new UnauthorizedError(Messages.AUTH_REQUIRED);
    }
    req.user = AuthService.resolverSesion(token);
    next();
}

export function requireRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.rol)) {
            throw new ForbiddenError(Messages.FORBIDDEN);
        }
        next();
    };
}
