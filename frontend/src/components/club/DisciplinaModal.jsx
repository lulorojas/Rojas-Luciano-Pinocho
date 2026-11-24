import ClubModal from './ClubModal.jsx';
import { Badge, CloseIcon, StepBar } from './parts.jsx';
import { DIAS, TIPO, accionFor, artOf, cuotaTxt, stepsFor } from '../../utils/club.js';

const franjas = (horarios) =>
    [...horarios].sort((a, b) => DIAS.indexOf(a.diaSemana) - DIAS.indexOf(b.diaSemana));

/**
 * Detalle de una disciplina. Visitante: explica y pide ser socio. Socio: muestra su estado si ya está
 * anotado, avisa si se superpone con otra de sus disciplinas y ofrece anotarse / pedir la prueba.
 */
export default function DisciplinaModal({
    disciplina,
    visitor = false,
    inscripcion = null,
    conflictos = [],
    blocked = false,
    busy = false,
    open,
    onClose,
    onExited,
    onRequest,
    onHacete,
    onLogin,
}) {
    const tipo = TIPO[disciplina.tipoInscripcion] ?? TIPO.directa;
    const esPrueba = disciplina.tipoInscripcion === 'prueba';
    const { art, ink } = artOf(disciplina.nombre);
    const horarios = franjas(disciplina.horarios ?? []);
    const deshabilitado = blocked || busy;

    let primaryLabel = esPrueba ? 'Pedir prueba' : conflictos.length ? 'Anotarme igual' : 'Anotarme';
    if (busy) primaryLabel = 'Enviando…';
    else if (blocked) primaryLabel = 'No disponible con la baja pedida';

    return (
        <ClubModal open={open} onClose={onClose} onExited={onExited} label={`Detalle de ${disciplina.nombre}`} busy={busy}>
            <div className="c-modal__head" style={{ background: art, color: ink }}>
                <div className="c-modal__head-row">
                    <Badge tone="white" className="">
                        <span style={{ color: tipo.tone === 'ok' ? '#07702f' : '#9a3412' }}>{tipo.label}</span>
                    </Badge>
                    <button type="button" className="c-close" onClick={onClose} aria-label="Cerrar"><CloseIcon /></button>
                </div>
                <h2>{disciplina.nombre}</h2>
            </div>

            <div className="c-modal__body">
                <p>{disciplina.descripcion}</p>
                <dl className="c-modal__dl">
                    <dt className="c-dt">Categorías</dt>
                    <dd>{disciplina.categorias || 'A confirmar'}</dd>
                    <dt className="c-dt">Horario</dt>
                    <dd>
                        {horarios.length === 0 && <span>A confirmar</span>}
                        {horarios.map((h) => (
                            <span key={`${h.diaSemana}${h.horaInicio}`}>{h.diaSemana} · {h.horaInicio} a {h.horaFin}</span>
                        ))}
                    </dd>
                    <dt className="c-dt">Cuota</dt>
                    <dd>{disciplina.cuotaAparte ? `${cuotaTxt(disciplina)}, aparte de la cuota social` : cuotaTxt(disciplina)}</dd>
                </dl>
                <Badge tone="provisorio" className="" size="">Provisorio · a confirmar por el club</Badge>

                <div className="c-howto">
                    <span>Cómo te sumás</span>
                    <p>
                        {esPrueba
                            ? 'Pedís una prueba, el club te asigna una fecha y después te informa si quedaste, si no quedaste o si quedás en lista de espera. Solo si quedás se activa la disciplina.'
                            : 'Te anotás y el club confirma tu lugar. Con el lugar confirmado, ya podés ir a entrenar.'}
                    </p>
                    {inscripcion && (
                        <>
                            <StepBar steps={stepsFor(inscripcion, disciplina)} />
                            <p className="c-howto__next">{accionFor(inscripcion, disciplina)}</p>
                        </>
                    )}
                </div>

                {conflictos.length > 0 && (
                    <div className="c-alert c-alert--warn" role="alert" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <strong>Se pisa con una disciplina tuya:</strong>
                        {conflictos.map((texto) => <span key={texto}>{texto}</span>)}
                    </div>
                )}

                {visitor && (
                    <div className="c-modal__foot c-modal__foot--start">
                        <strong>Para anotarte tenés que ser socio.</strong>
                        <div className="c-actions">
                            <button type="button" className="c-btn c-btn--lg c-btn--hacete" onClick={onHacete}>Hacete socio</button>
                            <button type="button" className="c-btn c-btn--lg c-btn--outline" onClick={onLogin}>Ya soy socio</button>
                        </div>
                    </div>
                )}

                {!visitor && !inscripcion && (
                    <div className="c-modal__foot">
                        <button type="button" className="c-btn c-btn--md c-btn--quiet" onClick={onClose}>Cerrar</button>
                        <button type="button" className="c-btn c-btn--md c-btn--primary" onClick={onRequest} disabled={deshabilitado}>
                            {primaryLabel}
                        </button>
                    </div>
                )}
            </div>
        </ClubModal>
    );
}
