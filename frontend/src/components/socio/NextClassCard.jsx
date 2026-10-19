import DisciplineArt from '../../assets/illustrations/DisciplineArt.jsx';
import { disciplineKind } from '../../utils/disciplineKind.js';
import { describeWhen } from '../../utils/schedule.js';
import { fullName } from '../../utils/formatters.js';

/** La próxima clase del socio, en lenguaje cercano: "Hoy · 18:00 · en 2 h 15 min". */
export default function NextClassCard({ horario, disciplina, profesor, date, now }) {
    const { day, countdown } = describeWhen(date, now);
    const kind = disciplineKind(disciplina.nombre);

    return (
        <section className={`next-class next-class--${kind}`} aria-labelledby="proxima-clase">
            <div className="next-class__art" aria-hidden="true">
                <DisciplineArt kind={kind} />
            </div>
            <div className="next-class__body">
                <h2 id="proxima-clase" className="next-class__label">Tu próxima clase</h2>
                <p className="next-class__name">{disciplina.nombre}</p>
                <p className="next-class__when">
                    <strong>{day}</strong> a las <time dateTime={horario.horaInicio}>{horario.horaInicio}</time>
                    <span className="countdown">{countdown}</span>
                </p>
                <p className="next-class__who">Con {fullName(profesor)} · hasta las {horario.horaFin}</p>
            </div>
        </section>
    );
}
