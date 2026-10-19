import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './authContextValue.js';
import { useToast } from '../hooks/useToast.js';
import { setUnauthorizedHandler } from '../services/api.js';
import { clearToken, getToken, setToken } from '../services/session.js';
import * as authService from '../services/authService.js';

/**
 * Estado de sesión: user (o null) y status 'loading' mientras se valida un token guardado.
 * El rol que se muestra viene siempre del servidor (GET /auth/me), nunca del token del navegador.
 */
export default function AuthProvider({ children }) {
    const toast = useToast();
    const [user, setUser] = useState(null);
    const [status, setStatus] = useState(() => (getToken() ? 'loading' : 'ready'));

    useEffect(() => {
        if (!getToken()) return undefined;
        let cancelled = false;
        authService.getCurrentUser()
            .then((current) => {
                if (!cancelled) setUser(current);
            })
            .catch(() => {
                clearToken();
            })
            .finally(() => {
                if (!cancelled) setStatus('ready');
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const logout = useCallback(() => {
        clearToken();
        setUser(null);
    }, []);

    // Sesión vencida en cualquier pedido: se cierra y se avisa una sola vez
    useEffect(() => {
        setUnauthorizedHandler(() => {
            if (!getToken()) return;
            logout();
            toast.info('Tu sesión venció. Iniciá sesión de nuevo para continuar.');
        });
        return () => setUnauthorizedHandler(null);
    }, [logout, toast]);

    const startSession = useCallback(({ token, user: sessionUser }) => {
        setToken(token);
        setUser(sessionUser);
        return sessionUser;
    }, []);

    const login = useCallback(async (credentials) => startSession(await authService.login(credentials)), [startSession]);
    const register = useCallback(async (data) => startSession(await authService.register(data)), [startSession]);

    const value = useMemo(
        () => ({ user, status, login, register, logout, setUser }),
        [user, status, login, register, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
