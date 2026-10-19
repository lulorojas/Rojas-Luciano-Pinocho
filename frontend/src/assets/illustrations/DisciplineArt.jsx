const WAVE = 'M-80 0q20-12 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0';
const DROPS = [
    { x: 236, y: 70, delay: '0s' },
    { x: 252, y: 58, delay: '0.3s' },
    { x: 270, y: 72, delay: '0.6s' },
];

function Swimming() {
    return (
        <>
            <rect width="320" height="200" fill="#c5e8f3" />
            <circle cx="268" cy="38" r="22" fill="#f5a30a" />
            <rect y="84" width="320" height="116" fill="#3b9cc0" />
            <rect y="84" width="320" height="26" fill="#58bad8" opacity="0.7" />
            {Array.from({ length: 16 }, (_, index) => (
                <circle key={index} cx={10 + index * 20} cy="124" r="5" fill={index % 2 ? '#fff' : '#d9582b'} />
            ))}
            <line x1="0" y1="124" x2="320" y2="124" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
            <g fill="none" stroke="#fff" strokeLinecap="round" opacity="0.55">
                <path className="wave" d={WAVE} transform="translate(0 100)" strokeWidth="4" />
                <path className="wave wave--slow" d={WAVE} transform="translate(0 150)" strokeWidth="4" />
                <path className="wave" d={WAVE} transform="translate(0 182)" strokeWidth="4" />
            </g>
            <g className="swim">
                <circle cx="130" cy="146" r="14" fill="#d9582b" />
                <rect x="119" y="142" width="22" height="8" rx="4" fill="#1b2a24" opacity="0.8" />
                <path d="M140 156q34-34 64-8" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
            </g>
            {DROPS.map((drop) => (
                <circle key={drop.x} className="drop" style={{ animationDelay: drop.delay }} cx={drop.x} cy={drop.y} r="4" fill="#fff" />
            ))}
        </>
    );
}

function Football() {
    return (
        <>
            {Array.from({ length: 8 }, (_, index) => (
                <rect key={index} x={index * 40} width="40" height="200" fill={index % 2 ? '#74b782' : '#82c28f'} />
            ))}
            <g fill="none" stroke="#fff" strokeWidth="3" opacity="0.85">
                <rect x="14" y="14" width="292" height="172" rx="6" />
                <line x1="160" y1="14" x2="160" y2="186" />
                <circle cx="160" cy="100" r="34" />
                <rect x="14" y="62" width="44" height="76" />
                <rect x="262" y="62" width="44" height="76" />
            </g>
            <ellipse cx="214" cy="160" rx="22" ry="6" fill="#2b2118" opacity="0.2" />
            <g transform="translate(214 126)">
                <g className="bounce">
                    <circle r="26" fill="#fff" stroke="#2b2118" strokeWidth="3" />
                    <polygon points="0,-13 12.5,-4 8,11 -8,11 -12.5,-4" fill="#2b2118" />
                    <path d="M0-13V-25M12.5-4 24-8M8 11l9 11M-8 11l-9 11M-12.5-4-24-8" stroke="#2b2118" strokeWidth="3" strokeLinecap="round" />
                </g>
            </g>
            <g transform="translate(70 138)">
                <path d="M0 24 14-4 28 24Z" fill="#f5a30a" />
                <rect x="-4" y="24" width="36" height="6" rx="3" fill="#d9582b" />
            </g>
        </>
    );
}

function Yoga() {
    return (
        <>
            <rect width="320" height="200" fill="#f8dcc4" />
            <circle className="pulse-soft" cx="160" cy="96" r="76" fill="#f5a30a" opacity="0.28" />
            <circle cx="160" cy="96" r="52" fill="#f5a30a" opacity="0.5" />
            <g className="sway" style={{ transformOrigin: '38px 190px' }}>
                <path d="M38 190C14 150 22 110 52 86 60 128 56 160 38 190Z" fill="#7fb28d" />
                <path d="M38 190C46 160 70 140 96 138 84 168 66 184 38 190Z" fill="#5f9f78" />
            </g>
            <g className="sway sway--reverse" style={{ transformOrigin: '284px 190px' }}>
                <path d="M284 190C306 150 298 110 268 86 260 128 264 160 284 190Z" fill="#7fb28d" />
                <path d="M284 190C276 160 252 140 226 138 238 168 256 184 284 190Z" fill="#5f9f78" />
            </g>
            <g transform="translate(160 70)">
                <circle cy="12" r="16" fill="#e9a77d" />
                <path d="M-16 8c2-16 32-16 32 0-8-6-24-6-32 0Z" fill="#3a2a22" />
                <path d="M-26 36q26-14 52 0l8 42h-68z" fill="#d9582b" />
                <path d="M-24 46q-24 14-16 40M24 46q24 14 16 40" fill="none" stroke="#e9a77d" strokeWidth="9" strokeLinecap="round" />
                <ellipse cy="86" rx="52" ry="16" fill="#3d5a8c" />
            </g>
            <rect x="92" y="160" width="136" height="10" rx="5" fill="#f5a30a" />
        </>
    );
}

function Basketball() {
    return (
        <>
            <rect width="320" height="200" fill="#eba583" />
            <rect y="156" width="320" height="44" fill="#c96a42" />
            <line x1="0" y1="156" x2="320" y2="156" stroke="#fff" strokeWidth="3" opacity="0.7" />
            <rect x="214" y="22" width="76" height="52" rx="6" fill="#fff" stroke="#2b2118" strokeWidth="3" />
            <rect x="238" y="42" width="28" height="22" fill="none" stroke="#d9582b" strokeWidth="3" />
            <ellipse cx="252" cy="82" rx="22" ry="6" fill="none" stroke="#f5a30a" strokeWidth="5" />
            <path d="M232 84 242 118M244 86 248 118M252 88V120M260 86 256 118M272 84 262 118" stroke="#fff" strokeWidth="2" opacity="0.9" />
            <path className="dash-flow" d="M108 134Q150 28 236 76" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="4 8" strokeLinecap="round" opacity="0.85" />
            <g transform="translate(104 126)">
                <g className="bounce">
                    <circle r="24" fill="#e4822f" stroke="#2b2118" strokeWidth="3" />
                    <path d="M-24 0H24M0-24V24M-17-17Q0 0-17 17M17-17Q0 0 17 17" fill="none" stroke="#2b2118" strokeWidth="2.5" />
                </g>
            </g>
        </>
    );
}

function Skating() {
    return (
        <>
            <rect width="320" height="200" fill="#f6d8ea" />
            <circle cx="52" cy="44" r="30" fill="#fff" opacity="0.35" />
            <circle cx="276" cy="150" r="46" fill="#fff" opacity="0.3" />
            <rect y="150" width="320" height="50" fill="#e9b3d2" />
            <ellipse cx="160" cy="166" rx="84" ry="9" fill="#2b2118" opacity="0.14" />
            <g className="float">
                <path d="M112 62h34l6 54h46a24 24 0 0 1 24 24v6H108Z" fill="#fff" stroke="#c0398a" strokeWidth="5" strokeLinejoin="round" />
                <path d="M146 62h14l5 30h-17Z" fill="#c0398a" />
                <rect x="104" y="146" width="108" height="9" rx="4.5" fill="#2b2118" />
                {[126, 148, 176, 198].map((x) => (
                    <g key={x}>
                        <circle cx={x} cy="164" r="11" fill="#f5a30a" stroke="#2b2118" strokeWidth="4" />
                        <circle cx={x} cy="164" r="3" fill="#2b2118" />
                    </g>
                ))}
                <path d="M112 84q-24 10-38 34" fill="none" stroke="#d9582b" strokeWidth="5" strokeLinecap="round" className="dash-flow" strokeDasharray="2 9" />
            </g>
            {[[48, 120], [262, 70], [236, 36], [86, 36]].map(([x, y], index) => (
                <g key={x} transform={`translate(${x} ${y})`}>
                    <path
                        className="twinkle"
                        style={{ animationDelay: `${index * 0.45}s` }}
                        d="M0-9 2.5-2.5 9 0 2.5 2.5 0 9-2.5 2.5-9 0-2.5-2.5Z"
                        fill="#fff"
                    />
                </g>
            ))}
        </>
    );
}

function Gymnastics() {
    return (
        <>
            <rect width="320" height="200" fill="#cfe3f8" />
            <circle cx="262" cy="44" r="24" fill="#fff" opacity="0.6" />
            <rect y="156" width="320" height="44" fill="#9fc1e8" />
            <rect x="46" y="116" width="228" height="14" rx="7" fill="#b9774a" />
            <rect x="74" y="130" width="10" height="42" rx="3" fill="#8a5a3a" />
            <rect x="236" y="130" width="10" height="42" rx="3" fill="#8a5a3a" />
            <g transform="translate(160 112)">
                <g className="sway" style={{ transformOrigin: '0px 0px' }}>
                    <circle cy="-72" r="13" fill="#e9a77d" />
                    <path d="M-13 -78c2-14 26-14 28 0-7-5-21-5-28 0Z" fill="#3a2a22" />
                    <path d="M-12 -58h24l5 40h-34Z" fill="#7a4fd0" />
                    <path d="M-10 -56 -36 -92M10 -56 36 -92" fill="none" stroke="#e9a77d" strokeWidth="8" strokeLinecap="round" />
                    <path d="M-8 -18 -16 0M8 -18 20 -4" fill="none" stroke="#e9a77d" strokeWidth="8" strokeLinecap="round" />
                </g>
            </g>
            <path
                className="dash-flow"
                d="M196 28c24 14 4 34 30 44s30-12 44-4"
                fill="none"
                stroke="#d9582b"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="3 9"
            />
            {[[56, 50], [112, 28], [286, 112]].map(([x, y], index) => (
                <g key={x} transform={`translate(${x} ${y})`}>
                    <path
                        className="twinkle"
                        style={{ animationDelay: `${index * 0.6}s` }}
                        d="M0-9 2.5-2.5 9 0 2.5 2.5 0 9-2.5 2.5-9 0-2.5-2.5Z"
                        fill="#fff"
                    />
                </g>
            ))}
        </>
    );
}

function Generic() {
    return (
        <>
            <rect width="320" height="200" fill="#f7dc94" />
            <circle cx="160" cy="100" r="82" fill="#f5a30a" opacity="0.25" />
            <path d="M132 32h28l-12 70zM188 32h-28l12 70z" fill="#d9582b" />
            <circle className="float" cx="160" cy="116" r="40" fill="#f5a30a" stroke="#fff" strokeWidth="5" />
            <path className="twinkle" d="M160 92l7.5 15 16.5 2.4-12 11.7 2.8 16.4-14.8-7.8-14.8 7.8 2.8-16.4-12-11.7 16.5-2.4Z" fill="#fff" />
            {[[48, 52], [270, 60], [60, 150], [262, 150]].map(([x, y], index) => (
                <circle key={x} className="twinkle" style={{ animationDelay: `${index * 0.5}s` }} cx={x} cy={y} r="5" fill="#fff" />
            ))}
        </>
    );
}

const ARTS = {
    natacion: Swimming,
    futbol: Football,
    yoga: Yoga,
    basquet: Basketball,
    patin: Skating,
    gimnasia: Gymnastics,
    generico: Generic,
};

/** Ilustración de una disciplina. Decorativa: el nombre de la disciplina siempre aparece como texto al lado. */
export default function DisciplineArt({ kind = 'generico', className = '' }) {
    const Art = ARTS[kind] ?? Generic;
    return (
        <svg
            className={`discipline-art ${className}`}
            viewBox="0 0 320 200"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            focusable="false"
        >
            <Art />
        </svg>
    );
}
