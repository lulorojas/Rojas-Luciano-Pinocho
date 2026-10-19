export default function Spinner({ size = 'md', label }) {
    if (!label) return <span className={`spinner spinner--${size}`} aria-hidden="true" />;

    return (
        <div className="spinner-block" role="status">
            <span className={`spinner spinner--${size}`} aria-hidden="true" />
            <span>{label}</span>
        </div>
    );
}
