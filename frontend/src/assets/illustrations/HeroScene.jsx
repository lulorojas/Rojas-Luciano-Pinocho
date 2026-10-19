import { useId } from 'react';

const SPARKLES = [
    { x: 96, y: 150, delay: '0s' },
    { x: 330, y: 70, delay: '0.8s' },
    { x: 560, y: 250, delay: '1.4s' },
    { x: 150, y: 270, delay: '0.4s' },
    { x: 400, y: 200, delay: '1.9s' },
];

const RAYS = Array.from({ length: 12 }, (_, index) => index * 30);

// Una tira de olas de 80 px de período; se desplaza de a un período para que el bucle no se note
const WAVE = 'M-80 372q20-14 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0';

/** Escena del club: pileta, cancha y yoga al sol. Decorativa: el texto de la página dice lo mismo. */
export default function HeroScene({ className = '' }) {
    const uid = useId().replace(/:/g, '');
    const sky = `${uid}-sky`;
    const water = `${uid}-water`;
    const pool = `${uid}-pool`;

    return (
        <svg className={`hero-scene ${className}`} viewBox="0 0 640 520" aria-hidden="true" focusable="false">
            <defs>
                <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffe9c7" />
                    <stop offset="1" stopColor="#f9c9a2" />
                </linearGradient>
                <linearGradient id={water} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#58bad8" />
                    <stop offset="1" stopColor="#2a86aa" />
                </linearGradient>
                <clipPath id={pool}>
                    <rect x="64" y="338" width="320" height="112" rx="30" />
                </clipPath>
            </defs>

            {/* Fondo orgánico */}
            <path
                d="M110 300C60 190 150 66 300 56S564 106 588 250 504 474 330 488 160 410 110 300Z"
                fill={`url(#${sky})`}
            />

            {/* Sol con rayos que giran muy despacio */}
            <g transform="translate(486 128)">
                <circle className="pulse-soft" r="74" fill="#f5a30a" opacity="0.18" />
                <g className="spin-slow">
                    {RAYS.map((angle) => (
                        <line
                            key={angle}
                            x1="0" y1="-62" x2="0" y2="-80"
                            stroke="#f5a30a" strokeWidth="6" strokeLinecap="round"
                            transform={`rotate(${angle})`}
                        />
                    ))}
                </g>
                <circle r="46" fill="#f5a30a" />
                <circle r="46" fill="#ffd36b" opacity="0.45" cx="-10" cy="-10" />
            </g>

            {/* Nubes */}
            <g className="drift" fill="#fff" opacity="0.92">
                <ellipse cx="190" cy="108" rx="44" ry="16" />
                <ellipse cx="166" cy="98" rx="24" ry="16" />
                <ellipse cx="212" cy="96" rx="28" ry="18" />
            </g>
            <g className="drift drift--slow" fill="#fff" opacity="0.8">
                <ellipse cx="400" cy="64" rx="34" ry="12" />
                <ellipse cx="384" cy="56" rx="18" ry="12" />
                <ellipse cx="418" cy="55" rx="20" ry="13" />
            </g>

            {/* Colinas */}
            <path d="M0 424C90 362 190 384 280 414S474 432 640 382V520H0Z" fill="#a9cfa6" />
            <path d="M0 474C120 432 250 452 360 472S560 484 640 452V520H0Z" fill="#5f9f78" />

            {/* Árbol */}
            <rect x="418" y="384" width="9" height="40" rx="4" fill="#8a5a3a" />
            <circle cx="422" cy="368" r="30" fill="#3f8a63" />
            <circle cx="446" cy="384" r="19" fill="#4c9b72" />

            {/* Pileta con carriles, olas y nadadora */}
            <rect x="48" y="322" width="352" height="144" rx="40" fill="#f3dcc0" />
            <rect x="64" y="338" width="320" height="112" rx="30" fill={`url(#${water})`} />
            <g clipPath={`url(#${pool})`}>
                <path className="wave" d={WAVE} fill="none" stroke="#fff" strokeWidth="5" opacity="0.55" strokeLinecap="round" />
                <path className="wave wave--slow" d={WAVE} transform="translate(0 38)" fill="none" stroke="#fff" strokeWidth="4" opacity="0.35" strokeLinecap="round" />
                <path className="wave" d={WAVE} transform="translate(0 74)" fill="none" stroke="#fff" strokeWidth="5" opacity="0.45" strokeLinecap="round" />
                <line x1="64" y1="394" x2="384" y2="394" stroke="#fff" strokeWidth="2" strokeDasharray="4 14" opacity="0.6" strokeLinecap="round" />
                <g className="swim">
                    <circle cx="214" cy="372" r="13" fill="#d9582b" />
                    <rect x="204" y="368" width="20" height="7" rx="3.5" fill="#1b2a24" opacity="0.8" />
                    <path d="M222 380q30-30 56-6" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
                </g>
            </g>
            <g transform="translate(112 424)">
                <g className="float">
                    <circle r="17" fill="none" stroke="#d9582b" strokeWidth="9" />
                    <circle r="17" fill="none" stroke="#fff" strokeWidth="9" strokeDasharray="13 13" />
                </g>
            </g>

            {/* Yoga sobre la colina */}
            <g transform="translate(500 330)">
                <circle className="pulse-soft" cx="0" cy="64" r="64" fill="#fff" opacity="0.28" />
                <circle cx="0" cy="22" r="17" fill="#e9a77d" />
                <path d="M-17 18c2-16 32-16 34 0-8-6-26-6-34 0Z" fill="#3a2a22" />
                <path d="M-26 46q26-14 52 0l8 44h-68z" fill="#d9582b" />
                <path d="M-24 56q-22 14-14 38M24 56q22 14 14 38" fill="none" stroke="#e9a77d" strokeWidth="9" strokeLinecap="round" />
                <ellipse cx="0" cy="98" rx="48" ry="15" fill="#3d5a8c" />
                <rect x="-64" y="108" width="128" height="9" rx="4.5" fill="#f5a30a" />
            </g>

            {/* Pelota que rebota */}
            <g transform="translate(576 450)">
                <g className="bounce">
                    <circle r="22" fill="#fff" stroke="#2b2118" strokeWidth="3" />
                    <polygon points="0,-11 11,-3 7,10 -7,10 -11,-3" fill="#2b2118" />
                    <path d="M0-11V-21M11-3 21-7M7 10l8 10M-7 10l-8 10M-11-3-21-7" stroke="#2b2118" strokeWidth="3" strokeLinecap="round" />
                </g>
            </g>

            {/* Destellos */}
            {SPARKLES.map((sparkle) => (
                <g key={`${sparkle.x}-${sparkle.y}`} transform={`translate(${sparkle.x} ${sparkle.y})`}>
                    <path
                        className="twinkle"
                        style={{ animationDelay: sparkle.delay }}
                        d="M0-9 2.5-2.5 9 0 2.5 2.5 0 9-2.5 2.5-9 0-2.5-2.5Z"
                        fill="#fff"
                    />
                </g>
            ))}
        </svg>
    );
}
