import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFound() {
    useDocumentTitle('Página no encontrada');
    return (
        <EmptyState
            level={1}
            title="Página no encontrada"
            message="La dirección que buscás no existe."
            action={<Link to="/" className="btn btn--primary btn--md">Volver al inicio</Link>}
        />
    );
}
