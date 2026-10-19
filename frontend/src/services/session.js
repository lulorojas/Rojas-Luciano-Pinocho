// El token vive en sessionStorage: se borra al cerrar la pestaña. Todo acceso va en try/catch
// porque el almacenamiento puede estar bloqueado (modo privado, políticas del navegador).
const TOKEN_KEY = 'pinocho.token';

export function getToken() {
    try {
        return sessionStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setToken(token) {
    try {
        sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
        // sin almacenamiento: la sesión dura lo que dure la página
    }
}

export function clearToken() {
    try {
        sessionStorage.removeItem(TOKEN_KEY);
    } catch {
        // nada que limpiar
    }
}
