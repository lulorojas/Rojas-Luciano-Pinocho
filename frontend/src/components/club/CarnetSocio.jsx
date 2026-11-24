import { useMemo } from 'react';
import qrcode from 'qrcode-generator';
import escudo from '../../assets/club/escudo-pinocho.png';

/** Código QR real con el número de socio, dibujado como un solo trazo SVG. */
function Qr({ numero }) {
    const { size, path } = useMemo(() => {
        const qr = qrcode(0, 'M');
        qr.addData(`PINOCHO-SOCIO-${numero}`);
        qr.make();
        const count = qr.getModuleCount();
        let d = '';
        for (let y = 0; y < count; y += 1) {
            for (let x = 0; x < count; x += 1) {
                if (qr.isDark(y, x)) d += `M${x} ${y}h1v1h-1z`;
            }
        }
        return { size: count, path: d };
    }, [numero]);

    return (
        <svg viewBox={`0 0 ${size} ${size}`} fill="#0b1f12" shapeRendering="crispEdges" role="img" aria-label={`Código QR del socio ${numero}`}>
            <path d={path} />
        </svg>
    );
}

/** Carnet digital: proporción de tarjeta, rayas verdes, franja naranja inferior y QR. */
export default function CarnetSocio({ nombre, numero, desde, estado = 'Socio activo' }) {
    return (
        <div className="c-carnet">
            <div className="c-carnet__band" aria-hidden="true" />
            <div className="c-carnet__top">
                <img src={escudo} alt="" width="40" height="40" />
                <span className="c-carnet__club">
                    <small>Club Social y Deportivo</small>
                    <strong>Pinocho</strong>
                </span>
                <span className="c-carnet__state">{estado}</span>
            </div>
            <div className="c-carnet__main">
                <div className="c-carnet__data">
                    <span className="c-carnet__label">Socio N.º</span>
                    <span className="c-carnet__num">{numero}</span>
                    <span className="c-carnet__name">{nombre}</span>
                    <span className="c-carnet__since">Desde {desde} · Villa Urquiza</span>
                </div>
                <div className="c-carnet__qr"><Qr numero={numero} /></div>
            </div>
        </div>
    );
}
