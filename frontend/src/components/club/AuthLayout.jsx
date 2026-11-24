import { Link } from 'react-router-dom';
import escudo from '../../assets/club/escudo-pinocho.png';

/**
 * Pantalla partida de Ingresar y Hacete socio: formulario a la izquierda (con "Volver al sitio") y, a la
 * derecha, el costado de rayas verdes con el carnet o el detalle de lo que se paga (`aside`).
 */
export default function AuthLayout({ children, aside }) {
    return (
        <div className="club">
            <a className="skip-link" href="#contenido">Saltar al contenido</a>
            <div className="c-auth">
                <div className="c-auth__main">
                    <div className="c-auth__top">
                        <Link to="/" className="c-brand">
                            <img src={escudo} alt="Escudo del Club Pinocho" width="40" height="44" />
                            <span className="c-brand__name">Pinocho</span>
                        </Link>
                        <Link to="/" className="c-btn c-btn--quiet" style={{ fontSize: 13 }}>Volver al sitio</Link>
                    </div>
                    <main id="contenido" style={{ display: 'contents' }}>{children}</main>
                </div>
                <aside className="c-auth__aside">{aside}</aside>
            </div>
        </div>
    );
}
