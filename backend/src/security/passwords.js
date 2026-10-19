// Hash de contraseñas con scrypt (incluido en Node): sal aleatoria por usuario y comparación en
// tiempo constante. La contraseña nunca se guarda ni se devuelve en texto plano.

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

/** Devuelve "scrypt$sal$hash" (base64). */
export function hashPassword(password) {
    const salt = randomBytes(16);
    const hash = scryptSync(password, salt, KEY_LENGTH);
    return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export function verifyPassword(password, stored) {
    const [scheme, saltB64, hashB64] = String(stored ?? '').split('$');
    if (scheme !== 'scrypt' || !saltB64 || !hashB64) {
        return false;
    }
    const expected = Buffer.from(hashB64, 'base64');
    const actual = scryptSync(String(password), Buffer.from(saltB64, 'base64'), expected.length);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Hash de relleno: se verifica contra él cuando el email no existe, para que el tiempo
// de respuesta no delate qué cuentas existen.
export const DUMMY_HASH = hashPassword('contraseña-inexistente');
