import { useCallback, useEffect, useState } from 'react';

/**
 * Ejecuta una función de carga (de services/) y expone data, loading y error.
 * `fetcher` debe ser estable (función de módulo o memorizada con useCallback).
 */
export function useResource(fetcher) {
    const [state, setState] = useState({ data: null, loading: true, error: null });
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let cancelled = false;

        fetcher()
            .then((data) => {
                if (!cancelled) setState({ data, loading: false, error: null });
            })
            .catch((error) => {
                if (!cancelled) setState({ data: null, loading: false, error: error.message });
            });

        return () => {
            cancelled = true;
        };
    }, [fetcher, version]);

    const reload = useCallback(() => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        setVersion((current) => current + 1);
    }, []);

    return { ...state, reload };
}
