import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';

export default function Header({ menuOpen, onToggleMenu }) {
    return (
        <header className="header">
            <Link to="/admin" className="header__brand">
                <img src={logo} alt="" width="36" height="36" />
                <span>Club Pinocho</span>
            </Link>
            <button
                type="button"
                className="header__menu-button"
                onClick={onToggleMenu}
                aria-expanded={menuOpen}
                aria-controls="menu-principal"
            >
                {menuOpen ? 'Cerrar menú' : 'Menú'}
            </button>
        </header>
    );
}
