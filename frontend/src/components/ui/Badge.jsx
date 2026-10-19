import { ESTADO_VARIANT } from '../../utils/constants.js';

export default function Badge({ children, variant }) {
    const resolved = variant ?? ESTADO_VARIANT[children] ?? 'neutral';
    return <span className={`badge badge--${resolved}`}>{children}</span>;
}
