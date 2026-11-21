import { useState } from 'react';
import PageIntro from '../../components/socio/PageIntro.jsx';
import DisciplineCard from '../../components/socio/DisciplineCard.jsx';
import DisciplineModal from '../../components/socio/DisciplineModal.jsx';
import Celebration from '../../components/socio/Celebration.jsx';
import Reveal from '../../components/socio/Reveal.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useDialog } from '../../hooks/useDialog.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useMiClub } from '../../hooks/useMiClub.js';
import { useToast } from '../../hooks/useToast.js';
import { getSuperposiciones, requestEnrollment } from '../../services/miClubService.js';
import { DIAS_SEMANA } from '../../utils/constants.js';

const STAGGER_MS = 50;

export default function Disciplinas() {
    useDocumentTitle('Disciplinas');
    const club = useMiClub();
    const toast = useToast();
    const detail = useDialog();
    const [day, setDay] = useState('');
    const [busy, setBusy] = useState(false);
    // Disciplinas del socio que se pisan con la elegida; null = todavía no se consultó
    const [aviso, setAviso] = useState(null);
    const [celebrating, setCelebrating] = useState(false);

    const activas = club.disciplinas.filter((disciplina) => disciplina.activa);
    const days = DIAS_SEMANA.filter((dia) => club.horarios.some(
        (horario) => horario.diaSemana === dia && activas.some((disciplina) => disciplina.id === horario.idDisciplina),
    ));
    const visible = day
        ? activas.filter((disciplina) => club.horariosDe(disciplina.id).some((horario) => horario.diaSemana === day))
        : activas;

    // El modal siempre muestra datos frescos (cupo e inscripción) aunque se recargue por detrás
    const selected = detail.target ? club.disciplinaById.get(detail.target.id) : null;

    const enroll = async () => {
        setBusy(true);
        try {
            // Primer intento: si hay horarios que se pisan se avisa y el socio decide si sigue
            if (aviso === null) {
                const conflictos = await getSuperposiciones(selected.id);
                if (conflictos.length > 0) {
                    setAviso(conflictos);
                    return;
                }
            }
            await requestEnrollment(selected.id);
            club.reload();
            detail.hide();
            setCelebrating(true);
            toast.success('Pedido enviado. El club te confirma el lugar muy pronto.');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <PageIntro
                title="Elegí cómo querés moverte"
                lead="Tocá una disciplina para ver los horarios, el cupo y la cuota. Pedir tu lugar es gratis: el club lo confirma antes de cobrar nada."
            />

            {days.length > 0 && (
                <div className="filter-chips" role="group" aria-label="Filtrar por día de clase">
                    <button type="button" className="chip" aria-pressed={day === ''} onClick={() => setDay('')}>Todos los días</button>
                    {days.map((dia) => (
                        <button key={dia} type="button" className="chip" aria-pressed={day === dia} onClick={() => setDay(dia)}>
                            {dia}
                        </button>
                    ))}
                </div>
            )}

            {visible.length === 0 ? (
                <EmptyState
                    title="Ese día no hay clases"
                    message="Probá con otro día o mirá todas las disciplinas."
                    action={<Button variant="secondary" onClick={() => setDay('')}>Ver todas</Button>}
                />
            ) : (
                <ul className="card-grid">
                    {visible.map((disciplina, index) => (
                        <Reveal as="li" key={disciplina.id} delay={Math.min(index, 8) * STAGGER_MS}>
                            <DisciplineCard
                                disciplina={disciplina}
                                horarios={club.horariosDe(disciplina.id)}
                                inscripcion={club.inscripcionVigente(disciplina.id)}
                                onOpen={detail.show}
                            />
                        </Reveal>
                    ))}
                </ul>
            )}

            {selected && (
                <DisciplineModal
                    disciplina={selected}
                    horarios={club.horariosDe(selected.id)}
                    profesorById={club.profesorById}
                    inscripcion={club.inscripcionVigente(selected.id)}
                    open={detail.open}
                    busy={busy}
                    aviso={aviso}
                    onEnroll={enroll}
                    onClose={detail.hide}
                    onExited={() => {
                        setAviso(null);
                        detail.reset();
                    }}
                />
            )}

            {celebrating && <Celebration message="¡Pedido enviado!" onDone={() => setCelebrating(false)} />}
        </>
    );
}
