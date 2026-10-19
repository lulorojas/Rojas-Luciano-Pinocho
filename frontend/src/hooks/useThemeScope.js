import { useEffect } from 'react';

/** Aplica un tema visual (p. ej. 'socio') a toda la página mientras el componente está montado. */
export function useThemeScope(theme) {
    useEffect(() => {
        const root = document.documentElement;
        const previous = root.dataset.theme;
        root.dataset.theme = theme;
        return () => {
            if (previous) root.dataset.theme = previous;
            else delete root.dataset.theme;
        };
    }, [theme]);
}
