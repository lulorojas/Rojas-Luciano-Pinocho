// Ilustraciones chicas para estados vacíos y mensajes. Siempre decorativas (aria-hidden).

function Frame({ children, className = '' }) {
    return (
        <svg className={`empty-art ${className}`} viewBox="0 0 200 160" aria-hidden="true" focusable="false">
            <ellipse cx="100" cy="146" rx="70" ry="8" fill="currentColor" opacity="0.08" />
            {children}
        </svg>
    );
}

/** Semana sin clases todavía */
export function CalendarArt() {
    return (
        <Frame>
            <circle cx="100" cy="76" r="62" fill="#f5a30a" opacity="0.2" />
            <rect x="48" y="38" width="104" height="92" rx="16" fill="#fffaf2" stroke="#d9582b" strokeWidth="4" />
            <path d="M48 62h104" stroke="#d9582b" strokeWidth="4" />
            <rect x="48" y="38" width="104" height="24" rx="16" fill="#d9582b" />
            <line x1="76" y1="30" x2="76" y2="46" stroke="#2b2118" strokeWidth="5" strokeLinecap="round" />
            <line x1="124" y1="30" x2="124" y2="46" stroke="#2b2118" strokeWidth="5" strokeLinecap="round" />
            {[0, 1, 2, 3, 4, 5].map((index) => (
                <circle
                    key={index}
                    cx={68 + (index % 3) * 32}
                    cy={84 + Math.floor(index / 3) * 26}
                    r="6"
                    fill={index === 4 ? '#0c6b4e' : '#e9d9c4'}
                    className={index === 4 ? 'pulse-soft' : undefined}
                />
            ))}
            <g transform="translate(166 40)"><path className="twinkle" d="M0-8 2-2 8 0 2 2 0 8-2 2-8 0-2-2Z" fill="#f5a30a" /></g>
        </Frame>
    );
}

/** Todo al día */
export function RelaxArt() {
    return (
        <Frame>
            <circle cx="100" cy="80" r="60" fill="#7fb28d" opacity="0.22" />
            <path d="M58 82h84v22a30 30 0 0 1-30 30H88a30 30 0 0 1-30-30z" fill="#fffaf2" stroke="#0c6b4e" strokeWidth="4" />
            <path d="M142 90h12a12 12 0 0 1 0 24h-14" fill="none" stroke="#0c6b4e" strokeWidth="4" />
            <rect x="58" y="76" width="84" height="12" rx="6" fill="#0c6b4e" />
            {[78, 100, 122].map((x, index) => (
                <path
                    key={x}
                    className="steam"
                    style={{ animationDelay: `${index * 0.5}s` }}
                    d={`M${x} 66c-8-8 8-14 0-24`}
                    fill="none" stroke="#0c6b4e" strokeWidth="4" strokeLinecap="round" opacity="0.6"
                />
            ))}
            <path d="M30 120c14-4 26 4 28 16-14 4-26-4-28-16ZM170 118c-14-4-26 4-28 16 14 4 26-4 28-16Z" fill="#5f9f78" />
        </Frame>
    );
}

/** Pagos online próximamente */
export function PaymentSoonArt() {
    return (
        <Frame>
            <circle cx="100" cy="80" r="60" fill="#f5a30a" opacity="0.2" />
            <rect x="38" y="60" width="124" height="74" rx="16" fill="#0c6b4e" />
            <rect x="38" y="60" width="124" height="22" rx="16" fill="#0a5a41" />
            <rect x="122" y="92" width="50" height="28" rx="14" fill="#fffaf2" stroke="#0a5a41" strokeWidth="4" />
            <circle cx="140" cy="106" r="5" fill="#0c6b4e" />
            <g className="float">
                <circle cx="84" cy="46" r="22" fill="#f5a30a" stroke="#fff" strokeWidth="4" />
                <path d="M84 36v20M77 42h11a4.5 4.5 0 0 1 0 9H78" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
            </g>
            <g transform="translate(160 44)">
                <circle r="16" fill="#fffaf2" stroke="#d9582b" strokeWidth="4" />
                <path d="M0-8V0l6 4" fill="none" stroke="#d9582b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
        </Frame>
    );
}

/** Sin inscripciones todavía */
export function StartArt() {
    return (
        <Frame>
            <circle cx="100" cy="80" r="60" fill="#d9582b" opacity="0.14" />
            <path d="M100 26c26 16 34 46 18 80H82C66 72 74 42 100 26Z" fill="#fffaf2" stroke="#d9582b" strokeWidth="4" strokeLinejoin="round" />
            <circle cx="100" cy="64" r="11" fill="#58bad8" stroke="#d9582b" strokeWidth="4" />
            <path d="M82 106 66 126l22-6M118 106l16 20-22-6" fill="#d9582b" />
            <path className="flame" d="M90 114q10 28 20 0z" fill="#f5a30a" />
            <g transform="translate(150 40)"><path className="twinkle" d="M0-8 2-2 8 0 2 2 0 8-2 2-8 0-2-2Z" fill="#f5a30a" /></g>
            <g transform="translate(44 56)">
                <path className="twinkle" style={{ animationDelay: '0.9s' }} d="M0-6 1.5-1.5 6 0 1.5 1.5 0 6-1.5 1.5-6 0-1.5-1.5Z" fill="#0c6b4e" />
            </g>
        </Frame>
    );
}
