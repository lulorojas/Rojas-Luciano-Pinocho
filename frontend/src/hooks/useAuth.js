import { useContext } from 'react';
import { AuthContext } from '../context/authContextValue.js';

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return context;
}

// Pantalla de inicio de cada rol
export const homeFor = (user) => (user?.rol === 'admin' ? '/admin' : '/socio');
