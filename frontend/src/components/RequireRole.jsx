import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { homeFor, useAuth } from '../hooks/useAuth.js';
import Spinner from './ui/Spinner.jsx';

/**
 * Protege un grupo de rutas. Es una comodidad de la interfaz: la garantía real de los permisos
 * está en el backend, que responde 401/403 aunque alguien llegue a esta pantalla por otro camino.
 */
export default function RequireRole({ role }) {
    const { user, status } = useAuth();
    const location = useLocation();

    if (status === 'loading') return <Spinner label="Verificando tu sesión…" />;
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    if (user.rol !== role) return <Navigate to={homeFor(user)} replace />;
    return <Outlet />;
}
