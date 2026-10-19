import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Button from '../ui/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { fullName } from '../../utils/formatters.js';

const LINKS = [
    { to: '/admin', label: 'Inicio', icon: 'home', end: true },
    { to: '/admin/disciplinas', label: 'Disciplinas', icon: 'activity' },
    { to: '/admin/socios', label: 'Socios', icon: 'users' },
    { to: '/admin/profesores', label: 'Profesores', icon: 'teacher' },
    { to: '/admin/horarios', label: 'Horarios', icon: 'clock' },
    { to: '/admin/inscripciones', label: 'Inscripciones', icon: 'clipboard' },
    { to: '/admin/cuotas', label: 'Cuotas', icon: 'card' },
];

export default function Sidebar({ open }) {
    const { user, logout } = useAuth();

    return (
        <nav id="menu-principal" className={`sidebar ${open ? 'sidebar--open' : ''}`} aria-label="Navegación principal">
            <ul>
                {LINKS.map((link) => (
                    <li key={link.to}>
                        <NavLink to={link.to} end={link.end} className="sidebar__link">
                            <Icon name={link.icon} />
                            {link.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
            <div className="sidebar__account">
                <p className="sidebar__user">
                    <strong>{fullName(user)}</strong>
                    <span>Administración</span>
                </p>
                <Button variant="secondary" size="sm" onClick={logout}>Cerrar sesión</Button>
            </div>
        </nav>
    );
}
