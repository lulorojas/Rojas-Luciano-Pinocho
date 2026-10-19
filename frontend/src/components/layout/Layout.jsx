import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { useFocusOnNavigate } from '../../hooks/useFocusOnNavigate.js';

export default function Layout() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const mainRef = useRef(null);
    useFocusOnNavigate(mainRef);

    // Al cambiar de pantalla se cierra el menú móvil (derivado durante el render, sin efecto)
    const [lastPath, setLastPath] = useState(location.pathname);
    if (lastPath !== location.pathname) {
        setLastPath(location.pathname);
        setMenuOpen(false);
    }

    useEffect(() => {
        if (!menuOpen) return undefined;
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [menuOpen]);

    return (
        <div className="layout">
            <a className="skip-link" href="#contenido">Saltar al contenido</a>
            <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((open) => !open)} />
            <Sidebar open={menuOpen} />
            <main id="contenido" ref={mainRef} className="layout__main" tabIndex={-1}>
                <Outlet />
            </main>
        </div>
    );
}
