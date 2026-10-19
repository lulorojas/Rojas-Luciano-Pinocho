import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Al cambiar de pantalla mueve el foco al contenido y sube al inicio, para que teclado y lectores
 * de pantalla no se queden en el enlace que ya desapareció. No actúa en la primera carga.
 */
export function useFocusOnNavigate(ref) {
    const { pathname } = useLocation();
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        ref.current?.focus({ preventScroll: true });
        window.scrollTo({ top: 0 });
    }, [pathname, ref]);
}
