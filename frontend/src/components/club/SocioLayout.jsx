import { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import MiClubProvider from '../../context/MiClubContext.jsx';
import SocioHeader from './SocioHeader.jsx';
import SocioModals from './SocioModals.jsx';
import { useFocusOnNavigate } from '../../hooks/useFocusOnNavigate.js';
import { useThemeScope } from '../../hooks/useThemeScope.js';

/** Estructura del panel de socio: encabezado con navegación, contenido y los modales. */
export default function SocioLayout() {
    useThemeScope('club');
    const mainRef = useRef(null);
    useFocusOnNavigate(mainRef);

    return (
        <div className="club">
            <a className="skip-link" href="#contenido">Saltar al contenido</a>
            <MiClubProvider>
                <SocioHeader />
                <main id="contenido" ref={mainRef} className="c-page" tabIndex={-1} style={{ outline: 'none' }}>
                    <Outlet />
                </main>
                <SocioModals />
            </MiClubProvider>
        </div>
    );
}
