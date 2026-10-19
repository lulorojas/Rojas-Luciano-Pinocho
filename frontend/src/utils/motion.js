// Los tiempos viven en CSS (--exit-duration); JS los lee para desmontar justo cuando termina la animación.
const FALLBACK_EXIT_MS = 180;

export function getExitMs() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--exit-duration').trim();
    if (!raw) return FALLBACK_EXIT_MS;
    const value = parseFloat(raw);
    if (Number.isNaN(value)) return FALLBACK_EXIT_MS;
    return raw.endsWith('ms') ? value : value * 1000;
}
