import { ESTADO_LABEL, ESTADO_VARIANT } from '../../utils/constants.js';

// Si el contenido es un estado conocido, se escribe con su etiqueta y toma su color.
export default function Badge({ children, variant }) {
    const resolved = variant ?? ESTADO_VARIANT[children] ?? 'neutral';
    return <span className={`badge badge--${resolved}`}>{ESTADO_LABEL[children] ?? children}</span>;
}
