import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/socio/AuthShell.jsx';
import ResourceForm from '../../components/ResourceForm.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { homeFor, useAuth } from '../../hooks/useAuth.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

const FIELDS = [
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'tunombre@mail.com' },
    { name: 'password', label: 'Contraseña', type: 'password', required: true },
];

const BENEFITS = [
    'Mirá tu próxima clase y cuánto falta',
    'Seguí el estado de tus inscripciones',
    'Consultá tus cuotas y vencimientos',
];

export default function Login() {
    useDocumentTitle('Ingresar');
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (user) return <Navigate to={homeFor(user)} replace />;

    const submit = async (values) => {
        setSubmitting(true);
        setError('');
        try {
            const sessionUser = await login(values);
            navigate(location.state?.from ?? homeFor(sessionUser), { replace: true });
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    return (
        <AuthShell
            title="Qué bueno verte de nuevo"
            lead="Ingresá con tu email y tu contraseña."
            aside={(
                <ul className="auth-benefits">
                    {BENEFITS.map((benefit) => (
                        <li key={benefit}><Icon name="check" size={18} strokeWidth={2.5} />{benefit}</li>
                    ))}
                </ul>
            )}
        >
            {error && <p className="form-error" role="alert">{error}</p>}
            <ResourceForm
                fields={FIELDS}
                initialValues={{ email: '', password: '' }}
                submitLabel="Ingresar"
                submitting={submitting}
                onSubmit={submit}
                block
                showLegend={false}
            />
            <p className="auth-card__switch">
                ¿Todavía no sos socio? <Link to="/registro">Asociate acá</Link>
            </p>
        </AuthShell>
    );
}
