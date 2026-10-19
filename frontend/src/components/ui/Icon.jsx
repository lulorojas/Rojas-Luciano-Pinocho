// Íconos de trazo (24x24), decorativos: el texto adyacente o el aria-label del botón aporta el significado accesible.
const PATHS = {
    home: <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
    activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
    users: (
        <>
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6" />
            <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.2 14.6c2 .8 3.3 2.7 3.3 5.4" />
        </>
    ),
    teacher: (
        <>
            <path d="m12 3 10 5-10 5L2 8z" />
            <path d="M6 10.5v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
        </>
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </>
    ),
    clipboard: (
        <>
            <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1z" />
            <path d="M8 6H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-2" />
            <path d="m9 14 2 2 4-4" />
        </>
    ),
    card: (
        <>
            <rect x="2" y="5" width="20" height="14" rx="3" />
            <path d="M2 10h20" />
        </>
    ),
    check: <path d="m5 12.5 4.5 4.5L19 7" />,
    alert: <path d="M12 6.5v7M12 17.5h.01" />,
    info: <path d="M12 11v6M12 7.5h.01" />,
    x: <path d="M6 6l12 12M18 6 6 18" />,
    trash: (
        <>
            <path d="M4 7h16M10 11v6M14 11v6" />
            <path d="M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3" />
        </>
    ),
    search: (
        <>
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4.2-4.2" />
        </>
    ),
    'sort-up': <path d="m7 14 5-5 5 5" />,
    'sort-down': <path d="m7 10 5 5 5-5" />,
    sort: <path d="m8 9 4-4 4 4M8 15l4 4 4-4" />,
    calendar: (
        <>
            <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
            <path d="M3.5 10h17M8 3v4M16 3v4" />
        </>
    ),
    user: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4.5 20c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5" />
        </>
    ),
    lock: (
        <>
            <rect x="5" y="11" width="14" height="9.5" rx="3" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </>
    ),
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    sun: (
        <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
        </>
    ),
};

export default function Icon({ name, size = 20, strokeWidth = 1.8 }) {
    return (
        <svg
            className="icon"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            {PATHS[name]}
        </svg>
    );
}
