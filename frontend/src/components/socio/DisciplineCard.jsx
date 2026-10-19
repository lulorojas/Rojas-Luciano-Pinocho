import DisciplineArt from '../../assets/illustrations/DisciplineArt.jsx';
import CupoMeter from './CupoMeter.jsx';
import Icon from '../ui/Icon.jsx';
import { disciplineKind } from '../../utils/disciplineKind.js';
import { formatCurrency } from '../../utils/formatters.js';
import { DIAS_SEMANA } from '../../utils/constants.js';

const STATUS_LABEL = {
    PENDIENTE: 'Solicitud enviada',
    CONFIRMADA: 'Ya sos parte',
    SUSPENDIDA: 'Lugar suspendido',
    BAJA_PENDIENTE: 'Baja pedida',
};

/**
 * Tarjeta de una disciplina. El título es un botón que se estira sobre toda la tarjeta (un solo
 * control accesible, sin anidar botones): el foco, el lector de pantalla y el clic hablan de lo mismo.
 */
export default function DisciplineCard({ disciplina, horarios, inscripcion, onOpen }) {
    const kind = disciplineKind(disciplina.nombre);
    const dias = DIAS_SEMANA.filter((dia) => horarios.some((horario) => horario.diaSemana === dia));
    const status = inscripcion ? STATUS_LABEL[inscripcion.estado] : null;

    return (
        <article className={`discipline-card discipline-card--${kind}`}>
            <div className="discipline-card__art">
                <DisciplineArt kind={kind} />
                {status && <span className={`status-pill status-pill--${inscripcion.estado.toLowerCase()}`}>{status}</span>}
            </div>
            <div className="discipline-card__body">
                <h3 className="discipline-card__title">
                    <button type="button" className="card-link" onClick={() => onOpen(disciplina)}>
                        {disciplina.nombre}
                    </button>
                </h3>
                <p className="discipline-card__desc">{disciplina.descripcion || 'Una buena forma de moverte y conocer gente.'}</p>
                {dias.length > 0 ? (
                    <ul className="day-chips" aria-label="Días de clase">
                        {dias.map((dia) => <li key={dia}>{dia.slice(0, 3)}</li>)}
                    </ul>
                ) : (
                    <p className="discipline-card__soon">Horarios por confirmar</p>
                )}
                <CupoMeter disponible={disciplina.cupoDisponible} maximo={disciplina.cupoMaximo} />
                <p className="discipline-card__foot">
                    <span className="price">{formatCurrency(disciplina.cuotaMensual)} <small>por mes</small></span>
                    <span className="discipline-card__more" aria-hidden="true">
                        Ver más <Icon name="arrow" size={16} />
                    </span>
                </p>
            </div>
        </article>
    );
}
