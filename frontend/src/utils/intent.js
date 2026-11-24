// Disciplinas que el visitante quiso anotarse antes de ser socio ("intención"). Se guardan en la pestaña
// (sessionStorage, siempre en try/catch) para que sobrevivan al pasar por Hacete socio / Ingresar.
const KEY = 'pinocho.intent';

export function getIntent() {
    try {
        const parsed = JSON.parse(sessionStorage.getItem(KEY) ?? '[]');
        return Array.isArray(parsed) ? parsed.filter(Number.isInteger) : [];
    } catch {
        return [];
    }
}

function save(ids) {
    try {
        sessionStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
        // sin almacenamiento: la intención se pierde al recargar
    }
}

export function addIntent(id) {
    const ids = getIntent();
    if (!ids.includes(id)) save([...ids, id]);
}

export function removeIntent(id) {
    save(getIntent().filter((item) => item !== id));
}

export function clearIntent() {
    save([]);
}
