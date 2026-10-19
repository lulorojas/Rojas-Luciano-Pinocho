import Icon from '../ui/Icon.jsx';

const STEPS = ['Solicitada', 'Confirmada', 'A entrenar'];

// Cuántos pasos están completos según el estado. Los estados que no son parte del camino
// (suspendida, baja pedida) muestran los pasos apagados y una explicación.
const DONE = { PENDIENTE: 1, CONFIRMADA: 3 };

const CAPTION = {
    PENDIENTE: 'El club revisa tu pedido y te confirma el lugar. Suele tardar entre 24 y 48 horas.',
    CONFIRMADA: '¡Todo listo! Ya podés ir a tus clases en los horarios de la disciplina.',
    SUSPENDIDA: 'Tu lugar está suspendido por ahora. Consultá en la administración del club.',
    BAJA_PENDIENTE: 'Pediste la baja. El club la confirma y libera tu lugar.',
    FINALIZADA: 'Esta inscripción ya finalizó.',
    CANCELADA: 'Esta solicitud fue cancelada.',
};

/** Pasos de una inscripción: explica en qué punto está y qué sigue, sin jerga. */
export default function EnrollmentSteps({ estado, compact = false }) {
    const inFlow = estado in DONE;
    const done = DONE[estado] ?? 0;

    return (
        <div className={`enroll-steps ${compact ? 'enroll-steps--compact' : ''}`}>
            <ol className="enroll-steps__list">
                {STEPS.map((step, index) => {
                    const state = !inFlow ? 'off' : index < done ? 'done' : index === done ? 'current' : 'todo';
                    return (
                        <li
                            key={step}
                            className={`enroll-steps__step enroll-steps__step--${state}`}
                            aria-current={state === 'current' ? 'step' : undefined}
                        >
                            <span className="enroll-steps__dot" aria-hidden="true">
                                {state === 'done' ? <Icon name="check" size={14} strokeWidth={3} /> : index + 1}
                            </span>
                            <span className="enroll-steps__name">
                                {step}
                                <span className="sr-only">
                                    {state === 'done' ? ' (listo)' : state === 'current' ? ' (ahora)' : state === 'todo' ? ' (falta)' : ''}
                                </span>
                            </span>
                        </li>
                    );
                })}
            </ol>
            <p className="enroll-steps__caption">{CAPTION[estado]}</p>
        </div>
    );
}
