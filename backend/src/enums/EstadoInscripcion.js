// Estados de una Inscripcion. El camino depende del tipo de disciplina (ver TipoInscripcion):
//
//   directa:  SOLICITADA → ACTIVA
//   prueba:   PRUEBA_SOLICITADA → PRUEBA_AGENDADA → ACTIVA (quedó) | ESPERA (lista de espera) | NO_QUEDO
//   ambas:    ACTIVA → BAJA_PENDIENTE → FINALIZADA   ·   CANCELADA (se retiró la solicitud o el club la rechazó)

export const EstadoInscripcion = Object.freeze({
    SOLICITADA: "SOLICITADA",
    PRUEBA_SOLICITADA: "PRUEBA_SOLICITADA",
    PRUEBA_AGENDADA: "PRUEBA_AGENDADA",
    ESPERA: "ESPERA",
    NO_QUEDO: "NO_QUEDO",
    ACTIVA: "ACTIVA",
    BAJA_PENDIENTE: "BAJA_PENDIENTE",
    FINALIZADA: "FINALIZADA",
    CANCELADA: "CANCELADA"
});

// Estados que solo existen en disciplinas con prueba.
export const ESTADOS_DE_PRUEBA = Object.freeze([
    EstadoInscripcion.PRUEBA_SOLICITADA,
    EstadoInscripcion.PRUEBA_AGENDADA,
    EstadoInscripcion.ESPERA,
    EstadoInscripcion.NO_QUEDO
]);

// Resultados que el club puede cargar después de una prueba.
export const RESULTADOS_DE_PRUEBA = Object.freeze([
    EstadoInscripcion.ACTIVA,
    EstadoInscripcion.ESPERA,
    EstadoInscripcion.NO_QUEDO
]);
