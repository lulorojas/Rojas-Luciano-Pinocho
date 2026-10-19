import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const TTL_SECONDS = 8 * 60 * 60;

let secret = process.env.AUTH_SECRET;
if (!secret) {
    secret = randomBytes(32).toString('hex');
    console.warn('AUTH_SECRET no está definido: se generó un secreto temporal (las sesiones se pierden al reiniciar).');
}

const encode = (value) => Buffer.from(value).toString('base64url');
const sign = (data) => createHmac('sha256', secret).update(data).digest();

/** Token firmado HMAC-SHA256 con { sub, rol, exp }. Solo prueba identidad: el rol real se vuelve a leer del store. */
export function createToken({ sub, rol }, { ttlSeconds = TTL_SECONDS } = {}) {
    const payload = encode(JSON.stringify({ sub, rol, exp: Math.floor(Date.now() / 1000) + ttlSeconds }));
    return `${payload}.${sign(payload).toString('base64url')}`;
}

export function verifyToken(token) {
    const [payload, signature, extra] = String(token ?? '').split('.');
    if (!payload || !signature || extra !== undefined) return null;

    const expected = sign(payload);
    const given = Buffer.from(signature, 'base64url');
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

    try {
        const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        if (typeof data.exp !== 'number' || data.exp < Date.now() / 1000) return null;
        return data;
    } catch {
        return null;
    }
}
