import { Link } from 'react-router-dom';
import PageIntro from '../../components/socio/PageIntro.jsx';
import NextClassCard from '../../components/socio/NextClassCard.jsx';
import OnboardingSteps from '../../components/socio/OnboardingSteps.jsx';
import EnrollmentSteps from '../../components/socio/EnrollmentSteps.jsx';
import PagoModal from '../../components/socio/PagoModal.jsx';
import Reveal from '../../components/socio/Reveal.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { RelaxArt } from '../../assets/illustrations/EmptyArt.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useDialog } from '../../hooks/useDialog.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useMiClub } from '../../hooks/useMiClub.js';
import { useNow } from '../../hooks/useNow.js';
import { nextOccurrence, daysUntil } from '../../utils/schedule.js';
import { formatCurrency, formatDate, formatPeriodLong } from '../../utils/formatters.js';

const todayLabel = (now) => new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);

export default function Inicio() {
    useDocumentTitle('Inicio');
    const { user } = useAuth();
    const club = useMiClub();
    const now = useNow();
    const pago = useDialog();

    // La próxima clase sale de las inscripciones confirmadas
    const upcoming = club.inscripciones
        .filter((inscripcion) => inscripcion.estado === 'CONFIRMADA')
        .flatMap((inscripcion) => club.horariosDe(inscripcion.idDisciplina).map((horario) => ({
            horario,
            disciplina: club.disciplinaById.get(inscripcion.idDisciplina),
            date: nextOccurrence(horario, now),
        })))
        .sort((a, b) => a.date - b.date)[0];

    const pendientes = club.cuotas
        .filter((cuota) => cuota.estado !== 'pagada')
        .sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));
    const proxima = pendientes[0];
    const diasProxima = proxima ? daysUntil(proxima.fechaVencimiento, now) : null;

    return (
        <>
            <PageIntro title={`Hola, ${user.nombre}`} lead={`Hoy es ${todayLabel(now)}. Esto es lo que viene en tu club.`} />

            <div className="inicio-grid">
                <div className="inicio-grid__main">
                    {club.vigentes.length === 0 ? (
                        <Reveal><OnboardingSteps /></Reveal>
                    ) : (
                        <>
                            {upcoming ? (
                                <Reveal>
                                    <NextClassCard
                                        horario={upcoming.horario}
                                        disciplina={upcoming.disciplina}
                                        profesor={club.profesorById.get(upcoming.horario.idProfesor)}
                                        date={upcoming.date}
                                        now={now}
                                    />
                                </Reveal>
                            ) : (
                                <Reveal>
                                    <section className="soft-card">
                                        <h2>Tu próxima clase</h2>
                                        <p className="muted">
                                            Cuando el club confirme tu inscripción, acá vas a ver cuándo y dónde entrenás.
                                        </p>
                                    </section>
                                </Reveal>
                            )}

                            <Reveal delay={60}>
                                <section className="soft-card" aria-labelledby="mis-inscripciones">
                                    <h2 id="mis-inscripciones">Mis inscripciones</h2>
                                    <ul className="inscripciones">
                                        {club.vigentes.map((inscripcion) => (
                                            <li key={inscripcion.id} className="inscripciones__item">
                                                <h3>{club.disciplinaById.get(inscripcion.idDisciplina)?.nombre}</h3>
                                                <EnrollmentSteps estado={inscripcion.estado} compact />
                                            </li>
                                        ))}
                                    </ul>
                                    <Link to="/socio/disciplinas" className="text-link">
                                        Sumarme a otra disciplina <Icon name="arrow" size={16} />
                                    </Link>
                                </section>
                            </Reveal>
                        </>
                    )}
                </div>

                <aside className="inicio-grid__side" aria-label="Tu cuota">
                    <Reveal delay={proxima ? 100 : 60}>
                        {proxima ? (
                            <section className={`soft-card cuota-highlight ${diasProxima < 0 ? 'cuota-highlight--late' : ''}`}>
                                <h2>Tu próxima cuota</h2>
                                <p className="cuota-highlight__period">{formatPeriodLong(proxima.periodo)}</p>
                                <p className="cuota-highlight__amount">{formatCurrency(proxima.monto)}</p>
                                <p className="muted">
                                    {diasProxima < 0
                                        ? `Venció el ${formatDate(proxima.fechaVencimiento)}.`
                                        : `Vence el ${formatDate(proxima.fechaVencimiento)}.`}
                                </p>
                                <div className="cuota-highlight__actions">
                                    <Button onClick={() => pago.show(proxima)}>Pagar ahora</Button>
                                    <Link to="/socio/cuotas" className="text-link">Ver todas</Link>
                                </div>
                            </section>
                        ) : (
                            <section className="soft-card soft-card--center">
                                <RelaxArt />
                                <h2>Estás al día</h2>
                                <p className="muted">No tenés cuotas pendientes. ¡Que disfrutes de tus clases!</p>
                            </section>
                        )}
                    </Reveal>
                </aside>
            </div>

            {pago.target && <PagoModal cuota={pago.target} open={pago.open} onClose={pago.hide} onExited={pago.reset} />}
        </>
    );
}
