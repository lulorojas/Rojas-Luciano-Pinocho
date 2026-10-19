import { useCallback, useState } from 'react';

/**
 * Estado de un diálogo con salida animada: `open` pide cerrar, `target` se conserva hasta que
 * el Modal termina de animar y llama a `reset` (onExited), así el contenido no desaparece antes.
 */
export function useDialog() {
    const [state, setState] = useState({ target: null, open: false });
    const show = useCallback((target = true) => setState({ target, open: true }), []);
    const hide = useCallback(() => setState((current) => ({ ...current, open: false })), []);
    const reset = useCallback(() => setState({ target: null, open: false }), []);
    return { target: state.target, open: state.open, show, hide, reset };
}
