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

// Solo se puede pedir la baja de lo que sigue en marcha
const PUEDE_PEDIR_BAJA = ['PENDIENTE', 'CONFIRMADA', 'SUSPENDIDA'];

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
            const wasPending = withdrawal.target.estado === 'PENDIENTE';
            await requestEnrollmentWithdrawal(withdrawal.target.id);
            club.reload();
            withdrawal.hide();
            toast.success(wasPending
                ? 'Cancelamos tu solicitud. Si cambiás de idea, podés volver a pedir tu lugar.'
                : 'Pediste la baja. El club la va a confirmar y liberar tu lugar.');
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
                            {PUEDE_PEDIR_BAJA.includes(inscripcion.estado) && (
                                <Button variant="danger-outline" size="sm" onClick={() => withdrawal.show(inscripcion)}>
                                    {inscripcion.estado === 'PENDIENTE' ? 'Cancelar solicitud' : 'Pedir la baja'}
                                    <span className="sr-only"> {disciplina.nombre}</span>
                                </Button>
                            )}
                        </Reveal>
                    );
                })}
            </ul>

            {withdrawal.target && (
                <ConfirmDialog
                    title={withdrawal.target.estado === 'PENDIENTE' ? 'Cancelar tu solicitud' : 'Pedir la baja de esta disciplina'}
                    message={withdrawal.target.estado === 'PENDIENTE'
                        ? `¿Querés cancelar tu solicitud para ${club.disciplinaById.get(withdrawal.target.idDisciplina)?.nombre}? Todavía no se generó ningún cobro.`
                        : `¿Querés dejar ${club.disciplinaById.get(withdrawal.target.idDisciplina)?.nombre}? El club confirma tu baja y libera tu lugar para otra persona. Podés volver a pedirlo cuando quieras.`}
                    confirmLabel={withdrawal.target.estado === 'PENDIENTE' ? 'Sí, cancelar' : 'Sí, pedir la baja'}
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
