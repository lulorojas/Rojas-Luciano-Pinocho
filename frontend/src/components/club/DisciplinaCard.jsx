import { Badge } from './parts.jsx';
import { ESTADO, TIPO, TONO_TINTA, artOf, cuotaTxt, horarioTxt } from '../../utils/club.js';

/**
 * Tarjeta de disciplina (sitio público y panel). `inscripcion` es la del socio, si ya está anotado:
 * agrega su estado en la cabecera y cambia el botón a "Ver estado".
 */
export default function DisciplinaCard({ disciplina, inscripcion = null, onOpen, onCta }) {
    const tipo = TIPO[disciplina.tipoInscripcion] ?? TIPO.directa;
    const { art, ink } = artOf(disciplina.nombre);
    const estado = inscripcion ? ESTADO[inscripcion.estado] : null;

    return (
        <article className="c-dcard">
            <button
                type="button"
                className="c-dcard__art"
                style={{ background: art, color: ink }}
                onClick={onOpen}
                aria-label={`Ver detalle de ${disciplina.nombre}`}
            >
                <span className="c-dcard__status">
                    {estado && <span className="c-badge c-badge--white" style={{ color: TONO_TINTA[estado[1]] }}>{estado[0]}</span>}
                </span>
                <span className="c-dcard__name">{disciplina.nombre}</span>
            </button>
            <div className="c-dcard__body">
                <div className="c-dcard__type">
                    <Badge tone={tipo.tone}>{tipo.label}</Badge>
                    <p>{tipo.corto}</p>
                </div>
                <dl className="c-dcard__dl">
                    <dt className="c-dt">Horario</dt>
                    <dd>{horarioTxt(disciplina.horarios ?? [])}</dd>
                    <dt className="c-dt">Cuota</dt>
                    <dd>{cuotaTxt(disciplina)}</dd>
                </dl>
                <div className="c-dcard__foot">
                    <button type="button" className="c-btn c-btn--quiet" onClick={onOpen}>Ver detalle</button>
                    <button type="button" className="c-btn c-btn--primary" onClick={onCta}>
                        {inscripcion ? 'Ver estado' : tipo.cta}
                    </button>
                </div>
            </div>
        </article>
    );
}
