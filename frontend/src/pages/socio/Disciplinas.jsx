import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DisciplinaCard from '../../components/club/DisciplinaCard.jsx';
import Reveal from '../../components/club/Reveal.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useMiClub } from '../../hooks/useMiClub.js';

export default function Disciplinas() {
    useDocumentTitle('Disciplinas');
    const { user } = useAuth();
    const club = useMiClub();
    const { hash } = useLocation();

    // "Anotarme directo" / "Pedir una prueba" llevan a su grupo
    useEffect(() => {
        if (!hash) return;
        const target = document.getElementById(hash.slice(1));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [hash]);

    const conPrueba = club.disponibles.filter((d) => d.tipoInscripcion === 'prueba');
    const directas = club.disponibles.filter((d) => d.tipoInscripcion !== 'prueba');

    const grupo = (id, titulo, texto, lista, ancho) => (
        <div id={id} className="c-block" style={{ gap: 16 }}>
            <div className="c-block__head">
                <h2 className="c-h3">{titulo}</h2>
                <p>{texto}</p>
            </div>
            <div className={`c-cards ${ancho}`}>
                {lista.map((disciplina, index) => (
                    <Reveal key={disciplina.id} index={index}>
                        <DisciplinaCard
                            disciplina={disciplina}
                            inscripcion={club.inscripcionDe(disciplina.id)}
                            onOpen={() => club.openModal({ type: 'disc', id: disciplina.id })}
                            onCta={() => club.openModal({ type: 'disc', id: disciplina.id })}
                        />
                    </Reveal>
                ))}
            </div>
        </div>
    );

    return (
        <div className="c-panel">
            <Reveal className="c-title">
                <h1 className="c-h1">Disciplinas</h1>
                <p className="c-sub">Horarios, cuotas y tipo de inscripción: provisorios hasta que el club los confirme.</p>
            </Reveal>

            {user.fechaBajaSolicitada && (
                <p className="c-alert c-alert--error" role="status">
                    Con el pedido de baja en trámite no podés anotarte en nuevas disciplinas.
                </p>
            )}

            {grupo('grupo-prueba', 'Con prueba', 'Pedís una prueba, el club te asigna fecha y te informa el resultado.', conPrueba, 'c-cards--mid')}
            {grupo('grupo-directa', 'Se anota directo', 'Te anotás y el club confirma tu lugar.', directas, '')}
        </div>
    );
}
