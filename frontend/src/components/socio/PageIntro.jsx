/** Encabezado cálido de cada pantalla: título + una frase que explica para qué sirve. */
export default function PageIntro({ title, lead, children }) {
    return (
        <div className="page-intro">
            <div>
                <h1>{title}</h1>
                {lead && <p className="page-intro__lead">{lead}</p>}
            </div>
            {children}
        </div>
    );
}
