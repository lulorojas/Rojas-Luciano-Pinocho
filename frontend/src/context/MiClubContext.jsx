import { useCallback, useMemo } from 'react';
import { MiClubContext } from './miClubContextValue.js';
import { useResource } from '../hooks/useResource.js';
import { getDisciplinas } from '../services/disciplinasService.js';
import { getHorarios } from '../services/horariosService.js';
import { getProfesores } from '../services/profesoresService.js';
import { getMisCuotas, getMisInscripciones } from '../services/miClubService.js';
import Spinner from '../components/ui/Spinner.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';

/**
 * Datos de la vista de socio, cargados una vez y compartidos entre pantallas.
 * El servidor ya filtra inscripciones y cuotas: acá solo llegan las del socio autenticado.
 */
export default function MiClubProvider({ children }) {
    const load = useCallback(async () => {
        const [disciplinas, horarios, profesores, inscripciones, cuotas] = await Promise.all([
            getDisciplinas(),
            getHorarios(),
            getProfesores(),
            getMisInscripciones(),
            getMisCuotas(),
        ]);
        return { disciplinas, horarios, profesores, inscripciones, cuotas };
    }, []);

    const { data, loading, error, reload } = useResource(load);

    const value = useMemo(() => {
        if (!data) return null;
        const disciplinaById = new Map(data.disciplinas.map((item) => [item.id, item]));
        const profesorById = new Map(data.profesores.map((item) => [item.id, item]));
        return {
            ...data,
            reload,
            disciplinaById,
            profesorById,
            horariosDe: (idDisciplina) => data.horarios.filter((horario) => horario.idDisciplina === idDisciplina),
            // La inscripción más reciente de cada disciplina que no esté dada de baja
            inscripcionVigente: (idDisciplina) => data.inscripciones.find(
                (inscripcion) => inscripcion.idDisciplina === idDisciplina && inscripcion.estado !== 'baja',
            ) ?? null,
            vigentes: data.inscripciones.filter((inscripcion) => inscripcion.estado !== 'baja'),
        };
    }, [data, reload]);

    if (loading && !data) return <Spinner label="Preparando tu club…" />;
    if (error && !data) return <ErrorState message={error} onRetry={reload} />;

    return <MiClubContext.Provider value={value}>{children}</MiClubContext.Provider>;
}
