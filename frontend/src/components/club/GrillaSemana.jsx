import { DIAS, DIAS_CORTOS, artOf, toMin } from '../../utils/club.js';

const INICIO = 16 * 60;
const TRAMO = 6 * 60;
const HORAS = [16, 17, 18, 19, 20, 21, 22];
const ALTO = 360;

const pct = (minutos) => `${((minutos - INICIO) / TRAMO) * 100}%`;

/**
 * Grilla Lun–Dom × 16:00–22:00, absoluta por minutos. `entries`: [{ disciplina, horario, pending }].
 * Las activas son un bloque sólido del color de la disciplina; las solicitadas o con baja pedida
 * (`pending`) llevan borde punteado. El día de hoy va resaltado.
 */
export default function GrillaSemana({ entries, now }) {
    const hoy = (now.getDay() + 6) % 7;

    return (
        <div className="c-week">
            <div className="c-week__grid" style={{ '--h': `${ALTO}px` }}>
                <div />
                {DIAS_CORTOS.map((corto, i) => (
                    <div key={corto} className={`c-week__day ${i === hoy ? 'is-today' : ''}`}>
                        <span>{corto}</span>
                    </div>
                ))}

                <div className="c-week__hours" aria-hidden="true">
                    {HORAS.map((h) => <span key={h} style={{ top: pct(h * 60) }}>{h}:00</span>)}
                </div>

                {DIAS.map((dia, i) => (
                    <div key={dia} className={`c-week__col ${i === hoy ? 'is-today' : ''}`}>
                        {HORAS.map((h) => <div key={h} className="c-week__line" style={{ top: pct(h * 60) }} />)}
                        {entries.filter((e) => e.horario.diaSemana === dia).map((e) => {
                            const { color, ink } = artOf(e.disciplina.nombre);
                            const inicio = toMin(e.horario.horaInicio);
                            const fin = toMin(e.horario.horaFin);
                            return (
                                <div
                                    key={`${e.disciplina.id}-${e.horario.horaInicio}`}
                                    className="c-week__block"
                                    style={{
                                        top: pct(inicio),
                                        height: `${((fin - inicio) / TRAMO) * 100}%`,
                                        background: e.pending ? `${color}1f` : color,
                                        color: e.pending ? '#0b1f12' : ink,
                                        border: `2px ${e.pending ? 'dashed' : 'solid'} ${color}`,
                                    }}
                                >
                                    <strong>{e.disciplina.nombre}</strong>
                                    <span>{e.horario.horaInicio}–{e.horario.horaFin}</span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
