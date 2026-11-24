// Piezas chicas del diseño del club: badges, barra de pasos, íconos de trazo.

export function Badge({ tone = 'ok', size, className = '', children }) {
    return <span className={`c-badge c-badge--${tone} ${size === 'sm' ? 'c-badge--sm' : ''} ${className}`}>{children}</span>;
}

export function StepBar({ steps }) {
    return (
        <ol className="c-stepbar">
            {steps.map((step) => (
                <li key={step.label}>
                    <i style={{ background: step.bar }} />
                    <span style={{ color: step.ink }}>{step.label}</span>
                </li>
            ))}
        </ol>
    );
}

export function CheckIcon({ size = 24, color = '#ff7a2e', width = 2.6 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

export function CloseIcon({ size = 18, width = 2.4 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    );
}

export function BellIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
    );
}
