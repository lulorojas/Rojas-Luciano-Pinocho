// Limita los intentos fallidos de inicio de sesión por clave (IP + email) dentro de una ventana de tiempo.

import TooManyRequestsError from '../exceptions/TooManyRequestsError.js';
import { Messages } from '../enums/Messages.js';

export function createLoginLimiter({ max = 5, windowMs = 60_000 } = {}) {
    const failures = new Map(); // clave -> [timestamps]

    function recent(key) {
        const now = Date.now();
        const list = (failures.get(key) ?? []).filter((time) => now - time < windowMs);
        failures.set(key, list);
        return list;
    }

    return {
        check(key) {
            if (recent(key).length >= max) {
                throw new TooManyRequestsError(Messages.LOGIN_RATE_LIMIT);
            }
        },
        fail(key) {
            recent(key).push(Date.now());
        },
        reset(key) {
            failures.delete(key);
        }
    };
}
