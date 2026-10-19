import Button from './Button.jsx';

export default function ErrorState({ title = 'No pudimos cargar la información', message, onRetry }) {
    return (
        <div className="error-state" role="alert">
            <h2 className="state__title">{title}</h2>
            <p>{message}</p>
            {onRetry && <Button variant="secondary" onClick={onRetry}>Reintentar</Button>}
        </div>
    );
}
