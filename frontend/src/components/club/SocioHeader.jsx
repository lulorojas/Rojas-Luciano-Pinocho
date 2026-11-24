import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import escudo from '../../assets/club/escudo-pinocho.png';
import { BellIcon, CloseIcon } from './parts.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useMiClub } from '../../hooks/useMiClub.js';
import { useNow } from '../../hooks/useNow.js';
import { haceTxt, inicialesDe } from '../../utils/club.js';

const LINKS = [
    ['/socio', 'Inicio', true],
    ['/socio/disciplinas', 'Disciplinas'],
    ['/socio/semana', 'Mi semana'],
    ['/socio/cuotas', 'Mis cuotas'],
    ['/socio/perfil', 'Perfil'],
];

/** Encabezado del panel de socio: secciones, campana de avisos (con no leídos), avatar y "Salir". Sin "Hacete socio". */
export default function SocioHeader() {
    const { user, logout } = useAuth();
    const club = useMiClub();
    const now = useNow();
    const [open, setOpen] = useState(false);
    const boxRef = useRef(null);
    const unread = club.avisos.filter((aviso) => !aviso.leido).length;

    // Cerrar el panel marca todo como leído (igual que el prototipo)
    const close = useCallback(() => {
        setOpen(false);
        club.markAvisosRead();
    }, [club]);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (event) => {
            if (event.key === 'Escape') close();
        };
        const onDown = (event) => {
            if (boxRef.current && !boxRef.current.contains(event.target)) close();
        };
        window.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onDown);
        return () => {
            window.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onDown);
        };
    }, [open, close]);

    return (
        <header className="c-header">
            <div className="c-header__bar">
                <Link to="/socio" className="c-brand">
                    <img src={escudo} alt="Escudo del Club Pinocho" width="40" height="44" />
                    <span className="c-brand__text">
                        <span className="c-brand__name">Pinocho</span>
                        <span className="c-brand__sub">Panel de socio</span>
                    </span>
                </Link>
                <nav className="c-nav" aria-label="Secciones de tu cuenta">
                    {LINKS.map(([to, label, end]) => (
                        <NavLink key={to} to={to} end={end} className="c-nav__link">{label}</NavLink>
                    ))}
                </nav>
                <div className="c-header__actions" ref={boxRef}>
                    <button
                        type="button"
                        className="c-bell"
                        aria-label={unread ? `Avisos del club, ${unread} sin leer` : 'Avisos del club'}
                        aria-expanded={open}
                        onClick={() => (open ? close() : setOpen(true))}
                    >
                        <BellIcon />
                        {unread > 0 && <span className="c-bell__count">{unread}</span>}
                    </button>
                    <Link to="/socio/perfil" className="c-avatar" aria-label="Tu perfil">{inicialesDe(user)}</Link>
                    <button type="button" className="c-btn c-btn--ghost" onClick={logout}>Salir</button>

                    <div className={`c-avisos ${open ? 'is-open' : ''}`} role="dialog" aria-label="Avisos del club">
                        <div className="c-avisos__head">
                            <span>Avisos del club</span>
                            <button type="button" className="c-iconbtn" onClick={close} aria-label="Cerrar avisos" style={{ width: 36, height: 36 }}>
                                <CloseIcon />
                            </button>
                        </div>
                        {club.avisos.length === 0 && <p className="c-avisos__item c-muted" style={{ display: 'block' }}>Todavía no tenés avisos.</p>}
                        {club.avisos.map((aviso) => (
                            <div key={aviso.id} className="c-avisos__item">
                                <span className={`c-avisos__dot ${aviso.leido ? '' : 'is-unread'}`} />
                                <div>
                                    <span className="c-avisos__title">{aviso.titulo}</span>
                                    <span className="c-avisos__body">{aviso.cuerpo}</span>
                                    <span className="c-avisos__when">{haceTxt(aviso.fecha, now)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="c-stripe" aria-hidden="true" />
        </header>
    );
}
