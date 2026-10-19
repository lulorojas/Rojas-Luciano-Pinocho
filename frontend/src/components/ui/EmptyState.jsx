// level: nivel de encabezado (2 dentro de una página con h1; 1 si el estado ocupa toda la pantalla)
export default function EmptyState({ title, message, action, level = 2 }) {
    const Heading = `h${level}`;
    return (
        <div className="empty-state">
            <Heading className="state__title">{title}</Heading>
            {message && <p>{message}</p>}
            {action}
        </div>
    );
}
