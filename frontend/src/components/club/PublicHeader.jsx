import { Link } from 'react-router-dom';
import escudo from '../../assets/club/escudo-pinocho.png';
import { homeFor, useAuth } from '../../hooks/useAuth.js';

const SECCIONES = [
    ['disciplinas', 'Disciplinas'],
    ['futsal', 'Futsal'],
    ['historia', 'Historia'],
    ['contacto', 'Contacto'],
];

/** Encabezado del sitio público: marca, secciones por ancla y los dos accesos (Ingresar / Hacete socio). */
export default function PublicHeader() {
    const { user } = useAuth();

    return (
        <header className="c-header">
            <div className="c-header__bar">
                <Link to="/" className="c-brand">
                    <img src={escudo} alt="Escudo del Club Pinocho" width="40" height="44" />
                    <span className="c-brand__text">
                        <span className="c-brand__name">Pinocho</span>
                        <span className="c-brand__sub">Club Social y Deportivo</span>
                    </span>
                </Link>
                <nav className="c-nav" aria-label="Secciones del club">
                    {SECCIONES.map(([id, label]) => (
                        <a key={id} href={`#${id}`} className="c-nav__link">{label}</a>
                    ))}
                </nav>
                <div className="c-header__actions">
                    {user ? (
                        <Link to={homeFor(user)} className="c-btn c-btn--md c-btn--primary">Ir a mi cuenta</Link>
                    ) : (
                        <>
                            <Link to="/ingresar" className="c-btn c-btn--outline">Ingresar</Link>
                            <Link to="/registro" className="c-btn c-btn--hacete">Hacete socio</Link>
                        </>
                    )}
                </div>
            </div>
            <div className="c-stripe" aria-hidden="true" />
        </header>
    );
}
