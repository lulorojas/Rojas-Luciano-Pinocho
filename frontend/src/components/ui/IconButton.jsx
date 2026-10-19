import Icon from './Icon.jsx';

/** Botón solo con ícono: el aria-label es obligatorio porque no hay texto visible. */
export default function IconButton({ icon, label, tone = 'neutral', ...props }) {
    return (
        <button type="button" className={`icon-button icon-button--${tone}`} aria-label={label} title={label} {...props}>
            <Icon name={icon} size={18} />
        </button>
    );
}
