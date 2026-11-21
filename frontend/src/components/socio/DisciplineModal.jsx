import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import DisciplineArt from '../../assets/illustrations/DisciplineArt.jsx';
import CupoMeter from './CupoMeter.jsx';
import EnrollmentSteps from './EnrollmentSteps.jsx';
import { disciplineKind } from '../../utils/disciplineKind.js';
import { formatCurrency, fullName } from '../../utils/formatters.js';
import { DIAS_SEMANA } from '../../utils/constants.js';

/**
 * Detalle de una disciplina y alta de la solicitud de inscripción.
 * El propio detalle es la confirmación: muestra qué se pide (cupo, horarios, cuota) y recién después el botón.
 */
export default function DisciplineModal({
    disciplina,
    horarios,
    profesorById,
    inscripcion,
    open,
    busy,
    aviso,
    onEnroll,
    onClose,
    onExited,
}) {
    const sorted = [...horarios].sort(
        (a, b) => DIAS_SEMANA.indexOf(a.diaSemana) - DIAS_SEMANA.indexOf(b.diaSemana) || a.horaInicio.localeCompare(b.horaInicio),
    );
    const sinCupo = disciplina.cupoDisponible <= 0;

    return (
        <Modal
            title={disciplina.nombre}
            open={open}
            dismissible={!busy}
            onClose={onClose}
            onExited={onExited}
            footer={(
                <>
                    <Button variant="ghost" onClick={onClose} disabled={busy}>Cerrar</Button>
                    {!inscripcion && (
                        <Button onClick={onEnroll} loading={busy} disabled={sinCupo} data-autofocus={sinCupo ? undefined : ''}>
                            {sinCupo ? 'Sin cupo por ahora' : aviso ? 'Inscribirme igual' : 'Solicitar mi lugar'}
                        </Button>
                    )}
                </>
            )}
        >
            <div className="discipline-modal">
                <div className="discipline-modal__art">
                    <DisciplineArt kind={disciplineKind(disciplina.nombre)} />
                </div>
                <p className="discipline-modal__desc">{disciplina.descripcion}</p>

                <h3 className="discipline-modal__heading">Cuándo se entrena</h3>
                {sorted.length === 0 ? (
                    <p className="muted">Todavía no hay horarios cargados. Pronto los vas a ver acá.</p>
                ) : (
                    <ul className="schedule-list">
                        {sorted.map((horario) => (
                            <li key={horario.id}>
                                <span className="schedule-list__day">{horario.diaSemana}</span>
                                <span className="schedule-list__time">{horario.horaInicio} a {horario.horaFin}</span>
                                <span className="schedule-list__who">con {fullName(profesorById.get(horario.idProfesor))}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="discipline-modal__facts">
                    <div>
                        <h3 className="discipline-modal__heading">Cupo</h3>
                        <CupoMeter disponible={disciplina.cupoDisponible} maximo={disciplina.cupoMaximo} />
                    </div>
                    <div>
                        <h3 className="discipline-modal__heading">Cuota</h3>
                        <p className="price price--lg">{formatCurrency(disciplina.cuotaMensual)} <small>por mes</small></p>
                    </div>
                </div>

                {aviso && !inscripcion && (
                    <div className="aviso" role="alert">
                        <strong>Ojo: esta disciplina se pisa con otra en la que ya estás inscripto/a.</strong>
                        <ul>
                            {aviso.map((conflicto) => (
                                <li key={conflicto.idDisciplina}>
                                    {conflicto.disciplina}:{' '}
                                    {conflicto.franjas.map((franja) => `${franja.diaSemana} ${franja.horaInicio} a ${franja.horaFin}`).join(', ')}
                                </li>
                            ))}
                        </ul>
                        Si igual querés pedir tu lugar, tocá “Inscribirme igual”.
                    </div>
                )}

                {inscripcion ? (
                    <EnrollmentSteps estado={inscripcion.estado} />
                ) : (
                    <p className="discipline-modal__note">
                        Al solicitar tu lugar, el club lo revisa y te lo confirma. Hasta entonces no se genera ningún cobro.
                    </p>
                )}
            </div>
        </Modal>
    );
}
