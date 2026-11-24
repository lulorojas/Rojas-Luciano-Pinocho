import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { homeFor, useAuth } from '../hooks/useAuth.js';
import Landing from '../pages/public/Landing.jsx';
import Spinner from './ui/Spinner.jsx';

/**
 * Protege un grupo de rutas. Es una comodidad de la interfaz: la garantía real de los permisos
 * está en el backend, que responde 401/403 aunque alguien llegue a esta pantalla por otro camino.
 * Quien no inició sesión y toca el panel de socio no ve una pantalla vacía: ve el sitio con el gate
 * ("Para entrar tenés que ser socio") que lo lleva a Hacete socio o Ingresar.
 */
export default function RequireRole({ role }) {
    const { user, status } = useAuth();
    const location = useLocation();

    if (status === 'loading') return <Spinner label="Verificando tu sesión…" />;
    if (!user) {
        if (role === 'socio') return <Landing gateMessage="Para entrar a tu panel tenés que ser socio" />;
        return <Navigate to="/ingresar" replace state={{ from: location.pathname }} />;
    }
    if (user.rol !== role) return <Navigate to={homeFor(user)} replace />;
    return <Outlet />;
}
