import { DIAS_SEMANA } from '../../utils/constants.js';
import { disciplineKind } from '../../utils/disciplineKind.js';

const todayName = (now) => DIAS_SEMANA[(now.getDay() + 6) % 7];

/**
 * Semana de lunes a domingo con las clases del socio.
 * items: [{ key, horario, disciplina, estado }] — las pendientes se ven con borde punteado y la etiqueta "Pendiente".
 * En pantallas angostas pasa a lista vertical, un día debajo del otro.
 */
export default function WeekGrid({ items, now }) {
    const today = todayName(now);

    return (
        <ol className="week">
            {DIAS_SEMANA.map((dia) => {
                const classes = items
                    .filter((item) => item.horario.diaSemana === dia)
                    .sort((a, b) => a.horario.horaInicio.localeCompare(b.horario.horaInicio));
                return (
                    <li key={dia} className={`week__day ${dia === today ? 'week__day--today' : ''}`}>
                        <h3 className="week__name">
                            {dia}
                            {dia === today && <span className="week__today">Hoy</span>}
                        </h3>
                        {classes.length === 0 ? (
                            <p className="week__free">Día libre</p>
                        ) : (
                            <ul className="week__classes">
                                {classes.map(({ key, horario, disciplina, estado }) => (
                                    <li
                                        key={key}
                                        className={`class-chip class-chip--${disciplineKind(disciplina.nombre)} ${estado === 'PENDIENTE' ? 'class-chip--pending' : ''}`}
                                    >
                                        <time className="class-chip__time" dateTime={horario.horaInicio}>{horario.horaInicio}</time>
                                        <span className="class-chip__name">{disciplina.nombre}</span>
                                        {estado === 'PENDIENTE' && <span className="class-chip__tag">Pendiente</span>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
