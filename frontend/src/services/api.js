import { getToken } from './session.js';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// La capa de sesión se registra acá para enterarse de los 401 sin que api.js dependa de React
let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
    onUnauthorized = handler;
}

/**
 * Único punto donde se hace fetch. Agrega el token, detecta respuestas incorrectas y
 * lanza un Error con el mensaje que devuelve el backend ({ message }).
 */
export async function request(path, options = {}) {
    const token = getToken();
    let response;
    try {
        response = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            },
        });
    } catch {
        throw new Error('No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.');
    }

    if (!response.ok) {
        const body = await response.json().catch(() => null);
        // Un 401 con token enviado significa sesión vencida (un login fallido no manda token)
        if (response.status === 401 && token) onUnauthorized?.();
        throw new Error(body?.message ?? `Error inesperado (${response.status})`);
    }

    if (response.status === 204) return null;
    return response.json();
}

/** Arma las operaciones CRUD estándar para un recurso REST (/recurso). */
export function createCrudService(resource) {
    const base = `/${resource}`;
    return {
        getAll: () => request(base),
        getById: (id) => request(`${base}/${id}`),
        create: (data) => request(base, { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => request(`${base}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        remove: (id) => request(`${base}/${id}`, { method: 'DELETE' }),
    };
}
