import { Link } from 'react-router-dom';
import { useThemeScope } from '../../hooks/useThemeScope.js';
import HeroScene from '../../assets/illustrations/HeroScene.jsx';
import logo from '../../assets/logo.svg';

/** Estructura de login y registro: el formulario a la izquierda y una escena cálida a la derecha (solo en pantallas anchas). */
export default function AuthShell({ title, lead, children, aside }) {
    useThemeScope('socio');

    return (
        <div className="auth-shell">
            <a className="skip-link" href="#contenido">Saltar al contenido</a>
            <main id="contenido" className="auth-shell__form">
                <Link to="/" className="socio-brand">
                    <img src={logo} alt="Logo" width="38" height="38" />
                    <span>Club Pinocho</span>
                </Link>
                <div className="auth-card">
                    <h1>{title}</h1>
                    {lead && <p className="auth-card__lead">{lead}</p>}
                    {children}
                </div>
            </main>
            <aside className="auth-shell__aside" aria-label="Sobre el club">
                <HeroScene className="auth-shell__scene" />
                {aside}
            </aside>
        </div>
    );
}
