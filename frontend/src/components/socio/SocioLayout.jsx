import { useRef } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import MiClubProvider from '../../context/MiClubContext.jsx';
import Icon from '../ui/Icon.jsx';
import Button from '../ui/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useFocusOnNavigate } from '../../hooks/useFocusOnNavigate.js';
import { useThemeScope } from '../../hooks/useThemeScope.js';
import logo from '../../assets/logo.svg';

const LINKS = [
    { to: '/socio', label: 'Inicio', icon: 'home', end: true },
    { to: '/socio/disciplinas', label: 'Disciplinas', icon: 'activity' },
    { to: '/socio/semana', label: 'Mi semana', icon: 'calendar' },
    { to: '/socio/cuotas', label: 'Mis cuotas', icon: 'card' },
    { to: '/socio/perfil', label: 'Perfil', icon: 'user' },
];

function NavItems({ withIcons }) {
    return LINKS.map((link) => (
        <li key={link.to}>
            <NavLink to={link.to} end={link.end} className="socio-nav__link">
                {withIcons && <Icon name={link.icon} size={22} />}
                <span>{link.label}</span>
            </NavLink>
        </li>
    ));
}

/** Estructura de la vista de socio: navegación arriba en escritorio y barra de pestañas abajo en celular. */
export default function SocioLayout() {
    useThemeScope('socio');
    const { user, logout } = useAuth();
    const mainRef = useRef(null);
    useFocusOnNavigate(mainRef);

    return (
        <div className="socio-shell">
            <a className="skip-link" href="#contenido">Saltar al contenido</a>
            <header className="socio-header">
                <Link to="/socio" className="socio-brand">
                    <img src={logo} alt="" width="38" height="38" />
                    <span>Club Pinocho</span>
                </Link>
                <nav className="socio-nav" aria-label="Secciones">
                    <ul><NavItems /></ul>
                </nav>
                <div className="socio-account">
                    <span className="socio-account__name">Hola, {user?.nombre}</span>
                    <Button variant="ghost" size="sm" onClick={logout}>Salir</Button>
                </div>
            </header>

            <main id="contenido" ref={mainRef} className="socio-main" tabIndex={-1}>
                <MiClubProvider>
                    <Outlet />
                </MiClubProvider>
            </main>

            <nav className="socio-tabbar" aria-label="Secciones (barra inferior)">
                <ul><NavItems withIcons /></ul>
            </nav>
        </div>
    );
}
