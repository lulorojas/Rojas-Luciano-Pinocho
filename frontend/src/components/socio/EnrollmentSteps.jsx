import Icon from '../ui/Icon.jsx';

const STEPS = ['Solicitada', 'Confirmada', 'A entrenar'];

// Cuántos pasos están completos según el estado de la inscripción
const DONE = { pendiente: 1, confirmada: 3 };

const CAPTION = {
    pendiente: 'El club revisa tu pedido y te confirma el lugar. Suele tardar entre 24 y 48 horas.',
    confirmada: '¡Todo listo! Ya podés ir a tus clases en los horarios de la disciplina.',
    baja: 'Esta inscripción está dada de baja.',
};

/** Pasos de una inscripción: explica en qué punto está y qué sigue, sin jerga. */
export default function EnrollmentSteps({ estado, compact = false }) {
    const done = DONE[estado] ?? 0;

    return (
        <div className={`enroll-steps ${compact ? 'enroll-steps--compact' : ''}`}>
            <ol className="enroll-steps__list">
                {STEPS.map((step, index) => {
                    const state = index < done ? 'done' : index === done ? 'current' : 'todo';
                    return (
                        <li
                            key={step}
                            className={`enroll-steps__step enroll-steps__step--${estado === 'baja' ? 'off' : state}`}
                            aria-current={estado !== 'baja' && state === 'current' ? 'step' : undefined}
                        >
                            <span className="enroll-steps__dot" aria-hidden="true">
                                {state === 'done' && estado !== 'baja' ? <Icon name="check" size={14} strokeWidth={3} /> : index + 1}
                            </span>
                            <span className="enroll-steps__name">
                                {step}
                                <span className="sr-only">{state === 'done' ? ' (listo)' : state === 'current' ? ' (ahora)' : ' (falta)'}</span>
                            </span>
                        </li>
                    );
                })}
            </ol>
            <p className="enroll-steps__caption">{CAPTION[estado]}</p>
        </div>
    );
}
