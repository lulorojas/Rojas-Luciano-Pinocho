import Spinner from './Spinner.jsx';

// variant: primary | secondary | ghost | danger | danger-outline
export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    type = 'button',
    loading = false,
    disabled = false,
    ...props
}) {
    return (
        <button
            type={type}
            className={`btn btn--${variant} btn--${size}`}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...props}
        >
            {loading && <Spinner size="sm" />}
            {children}
        </button>
    );
}
