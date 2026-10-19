import { verifyToken } from './tokens.js';
import { findUserByRoleAndId } from './users.js';
import { forbidden, unauthorized } from '../utils/httpError.js';

/**
 * Exige un token válido y carga req.user desde el store.
 * El rol sale del store, no del token: aunque alguien pudiera alterar el payload, la firma lo impediría
 * y, si el usuario cambió de rol o fue eliminado, el token deja de servir.
 */
export function requireAuth(req, res, next) {
    const [scheme, token] = (req.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) throw unauthorized();

    const payload = verifyToken(token);
    if (!payload) throw unauthorized('Tu sesión venció o no es válida. Iniciá sesión de nuevo.');

    const user = findUserByRoleAndId(payload.rol, payload.sub);
    if (!user || user.rol !== payload.rol) throw unauthorized('Tu sesión venció o no es válida. Iniciá sesión de nuevo.');

    req.user = user;
    next();
}

export const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.rol)) throw forbidden();
    next();
};

/** El admin pasa; el socio solo puede leer (GET). Cualquier otra combinación es 403. */
export function adminOrReadOnly(req, res, next) {
    if (req.user.rol === 'admin') return next();
    if (req.user.rol === 'socio' && req.method === 'GET') return next();
    throw forbidden();
}
