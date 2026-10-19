import { store } from '../store/memoryStore.js';

export function findUserByEmail(email) {
    const needle = String(email ?? '').trim().toLowerCase();
    if (!needle) return null;
    const matches = (user) => user.email.toLowerCase() === needle;
    return store.administradores.items.find(matches) ?? store.socios.items.find(matches) ?? null;
}

export function findUserByRoleAndId(rol, id) {
    if (rol === 'admin') return store.administradores.items.find((user) => user.id === id) ?? null;
    if (rol === 'socio') return store.socios.items.find((user) => user.id === id) ?? null;
    return null;
}

/** Nunca se expone el hash de la contraseña. */
export function publicUser(user) {
    const { passwordHash, ...rest } = user;
    return rest;
}
