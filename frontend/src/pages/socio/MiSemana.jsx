import { useNavigate } from 'react-router-dom';
import GrillaSemana from '../../components/club/GrillaSemana.jsx';
import Reveal from '../../components/club/Reveal.jsx';
import { Badge } from '../../components/club/parts.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useMiClub } from '../../hooks/useMiClub.js';
import { useNow } from '../../hooks/useNow.js';
import { ESTADO, accionFor, artOf } from '../../utils/club.js';

export default function MiSemana() {
    useDocumentTitle('Mi semana');
    const club = useMiClub();
    const navigate = useNavigate();
    const now = useNow();

    const conDisciplina = club.abiertas.filter((i) => club.disciplinaById.has(i.idDisciplina));
    // En la grilla: activas (sólidas) y solicitadas o con baja pedida (punteadas)
    const entries = conDisciplina
        .filter((i) => ['ACTIVA', 'SOLICITADA', 'BAJA_PENDIENTE'].includes(i.estado))
        .flatMap((i) => {
            const disciplina = club.disciplinaById.get(i.idDisciplina);
            return (disciplina.horarios ?? []).map((horario) => ({ disciplina, horario, pending: i.estado !== 'ACTIVA' }));
        });
    const items = conDisciplina.filter((i) => i.estado !== 'NO_QUEDO');

    return (
        <div className="c-panel">
            <Reveal className="c-title c-title--row">
                <div>
                    <h1 className="c-h1">Mi semana</h1>
                    <p className="c-sub">Tus entrenamientos de la semana.</p>
                </div>
                <div className="c-legend">
                    <span><i />Activa</span>
                    <span><i className="is-dashed" />Esperando confirmación o baja pedida</span>
                </div>
            </Reveal>

            <Reveal index={1}><GrillaSemana entries={entries} now={now} /></Reveal>

            {items.length > 0 ? (
                <Reveal index={2} as="ul" className="c-weeks">
                    {items.map((inscripcion) => {
                        const disciplina = club.disciplinaById.get(inscripcion.idDisciplina);
                        const estado = ESTADO[inscripcion.estado];
                        return (
                            <li key={inscripcion.id} className="c-week-item" style={{ '--edge': artOf(disciplina.nombre).color }}>
                                <div className="c-week-item__head">
                                    <strong>{disciplina.nombre}</strong>
                                    <Badge tone={estado[1]}>{estado[0]}</Badge>
                                </div>
                                <p>{accionFor(inscripcion, disciplina)}</p>
                                {inscripcion.estado === 'ACTIVA' && (
                                    <button
                                        type="button"
                                        className="c-btn c-btn--danger-outline"
                                        onClick={() => club.openModal({ type: 'bajaDisc', id: inscripcion.id })}
                                    >
                                        Pedir la baja
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </Reveal>
            ) : (
                <div className="c-empty">
                    <span>Todavía no tenés entrenamientos en tu semana.</span>
                    <button type="button" className="c-btn c-btn--primary" onClick={() => navigate('/socio/disciplinas')}>Ver disciplinas</button>
                </div>
            )}
        </div>
    );
}
