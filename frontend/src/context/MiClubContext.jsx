import { useCallback, useMemo } from 'react';
import { MiClubContext } from './miClubContextValue.js';
import { useResource } from '../hooks/useResource.js';
import { useDialog } from '../hooks/useDialog.js';
import { getDisciplinas } from '../services/disciplinasService.js';
import { getMisAvisos, getMisCuotas, getMisInscripciones, markAvisosRead } from '../services/miClubService.js';
import { CERRADAS } from '../utils/club.js';

const estaAbierta = (inscripcion) => !CERRADAS.includes(inscripcion.estado);

/**
 * Datos del panel de socio, cargados una vez y compartidos entre pantallas: disciplinas (con sus
 * horarios), inscripciones, cuotas y avisos. El servidor ya filtra todo por el socio autenticado.
 * También guarda qué modal está abierto (detalle de disciplina, pago, bajas) para que cualquier
 * pantalla pueda abrirlos con `openModal`.
 */
export default function MiClubProvider({ children }) {
    const modal = useDialog();

    const load = useCallback(async () => {
        const [disciplinas, inscripciones, cuotas, avisos] = await Promise.all([
            getDisciplinas(),
            getMisInscripciones(),
            getMisCuotas(),
            getMisAvisos(),
        ]);
        return { disciplinas, inscripciones, cuotas, avisos };
    }, []);

    const { data, loading, error, reload } = useResource(load);

    const markRead = useCallback(async () => {
        if (!data?.avisos.some((aviso) => !aviso.leido)) return;
        try {
            await markAvisosRead();
            reload();
        } catch {
            // no es crítico: los avisos siguen figurando como no leídos
        }
    }, [data, reload]);

    const value = useMemo(() => {
        if (!data) return null;
        const disciplinaById = new Map(data.disciplinas.map((item) => [item.id, item]));
        const abiertas = data.inscripciones.filter(estaAbierta);
        return {
            ...data,
            reload,
            disciplinaById,
            // Solo disciplinas activas se muestran para anotarse
            disponibles: data.disciplinas.filter((item) => item.activa),
            abiertas,
            // La inscripción abierta de una disciplina (las finalizadas o canceladas ya no cuentan)
            inscripcionDe: (idDisciplina) => abiertas.find((inscripcion) => inscripcion.idDisciplina === idDisciplina) ?? null,
            markAvisosRead: markRead,
            modal,
            openModal: (target) => modal.show(target),
        };
    }, [data, reload, markRead, modal]);

    if (loading && !data) return <p className="c-spinner" role="status">Preparando tu club…</p>;
    if (error && !data) {
        return (
            <div className="c-panel">
                <p className="c-error" role="alert">{error}</p>
                <button type="button" className="c-btn c-btn--primary" style={{ alignSelf: 'flex-start' }} onClick={reload}>
                    Reintentar
                </button>
            </div>
        );
    }

    return <MiClubContext.Provider value={value}>{children}</MiClubContext.Provider>;
}
