const label = (disponible) => {
    if (disponible <= 0) return 'Sin cupo por ahora';
    if (disponible === 1) return 'Queda 1 lugar';
    if (disponible <= 5) return `Quedan ${disponible} lugares`;
    return `${disponible} lugares disponibles`;
};

/** Barra de cupo con el dato en palabras: la barra es un refuerzo visual, el texto es lo que se lee. */
export default function CupoMeter({ disponible, maximo }) {
    const ocupado = maximo > 0 ? Math.min(Math.round(((maximo - disponible) / maximo) * 100), 100) : 100;
    const tone = disponible <= 0 ? 'full' : disponible <= 3 ? 'low' : 'ok';

    return (
        <div className={`cupo cupo--${tone}`}>
            <div className="cupo__bar" aria-hidden="true">
                <span className="cupo__fill" style={{ '--fill': `${ocupado}%` }} />
            </div>
            <p className="cupo__label">{label(disponible)}</p>
        </div>
    );
}
