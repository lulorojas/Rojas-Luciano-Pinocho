import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageIntro from '../../components/socio/PageIntro.jsx';
import WeekGrid from '../../components/socio/WeekGrid.jsx';
import EnrollmentSteps from '../../components/socio/EnrollmentSteps.jsx';
import Reveal from '../../components/socio/Reveal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Button from '../../components/ui/Button.jsx';
import DisciplineArt from '../../assets/illustrations/DisciplineArt.jsx';
import { CalendarArt } from '../../assets/illustrations/EmptyArt.jsx';
import { useDialog } from '../../hooks/useDialog.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useMiClub } from '../../hooks/useMiClub.js';
import { useNow } from '../../hooks/useNow.js';
import { useToast } from '../../hooks/useToast.js';
import { requestEnrollmentWithdrawal } from '../../services/miClubService.js';
import { disciplineKind } from '../../utils/disciplineKind.js';

export default function MiSemana() {
    useDocumentTitle('Mi semana');
    const club = useMiClub();
    const toast = useToast();
    const now = useNow();
    const withdrawal = useDialog();
    const [busy, setBusy] = useState(false);

    const items = club.vigentes.flatMap((inscripcion) => {
        const disciplina = club.disciplinaById.get(inscripcion.idDisciplina);
        return club.horariosDe(inscripcion.idDisciplina).map((horario) => ({
            key: `${inscripcion.id}-${horario.id}`,
            horario,
            disciplina,
            estado: inscripcion.estado,
        }));
    });

    const confirmWithdrawal = async () => {
        setBusy(true);
        try {
            await requestEnrollmentWithdrawal(withdrawal.target.id);
            club.reload();
            withdrawal.hide();
            toast.success('Listo, tu baja quedó registrada. Si cambiás de idea, podés volver a inscribirte.');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setBusy(false);
        }
    };

    if (club.vigentes.length === 0) {
        return (
            <>
                <PageIntro title="Mi semana" lead="Acá vas a ver tus clases de lunes a domingo." />
                <section className="soft-card soft-card--center">
                    <CalendarArt />
                    <h2>Tu semana está libre</h2>
                    <p className="muted">Todavía no te inscribiste en ninguna disciplina. Elegí una y armá tu rutina.</p>
                    <Link to="/socio/disciplinas" className="btn btn--primary btn--md">Ver disciplinas</Link>
                </section>
            </>
        );
    }

    return (
        <>
            <PageIntro
                title="Mi semana"
                lead="Tus clases de lunes a domingo. Las de borde punteado todavía esperan la confirmación del club."
            />
            <Reveal><WeekGrid items={items} now={now} /></Reveal>

            <h2 className="section-title">Mis disciplinas</h2>
            <ul className="my-disciplines">
                {club.vigentes.map((inscripcion, index) => {
                    const disciplina = club.disciplinaById.get(inscripcion.idDisciplina);
                    return (
                        <Reveal as="li" key={inscripcion.id} delay={index * 50} className="my-discipline">
                            <div className="my-discipline__art"><DisciplineArt kind={disciplineKind(disciplina.nombre)} /></div>
                            <div className="my-discipline__body">
                                <h3>{disciplina.nombre}</h3>
                                <EnrollmentSteps estado={inscripcion.estado} compact />
                            </div>
                            <Button variant="danger-outline" size="sm" onClick={() => withdrawal.show(inscripcion)}>
                                Dar de baja<span className="sr-only"> {disciplina.nombre}</span>
                            </Button>
                        </Reveal>
                    );
                })}
            </ul>

            {withdrawal.target && (
                <ConfirmDialog
                    title="Dar de baja esta disciplina"
                    message={`¿Querés dejar ${club.disciplinaById.get(withdrawal.target.idDisciplina)?.nombre}? Vas a liberar tu lugar para otra persona. Podés volver a pedirlo cuando quieras.`}
                    confirmLabel="Sí, dar de baja"
                    open={withdrawal.open}
                    loading={busy}
                    onConfirm={confirmWithdrawal}
                    onCancel={withdrawal.hide}
                    onExited={withdrawal.reset}
                />
            )}
        </>
    );
}
