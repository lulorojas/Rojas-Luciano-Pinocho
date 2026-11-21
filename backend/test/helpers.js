// Utilidades compartidas por los tests de la API: levantar el servidor en un puerto libre,
// hacer pedidos y abrir sesión. Cada archivo de test corre en su propio proceso, así que cada uno
// parte de los datos de ejemplo.

import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { DEMO_PASSWORD } from '../src/security/demoPassword.js';

let server;
let base;

export async function iniciarServidor() {
    server = createApp().listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    base = `http://localhost:${server.address().port}/api`;
}

export function detenerServidor() {
    return new Promise((resolve) => server.close(resolve));
}

export const baseUrl = () => base;

// Las respuestas de la API tienen el formato { success, data } o { success: false, message }.
// Acá `body` es `data` si salió bien, o el objeto completo (con `message`) si falló.
export async function call(path, { method = 'GET', token, body } = {}) {
    const response = await fetch(`${base}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await response.text();
    const parsed = text ? JSON.parse(text) : null;
    return { status: response.status, body: parsed?.success ? parsed.data : parsed, text };
}

export async function login(email, password = DEMO_PASSWORD) {
    const { status, body } = await call('/auth/login', { method: 'POST', body: { email, password } });
    assert.equal(status, 200, `login de ${email} debería funcionar`);
    return body;
}
