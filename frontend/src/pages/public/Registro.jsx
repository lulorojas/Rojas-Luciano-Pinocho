import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/socio/AuthShell.jsx';
import ResourceForm from '../../components/ResourceForm.jsx';
import { homeFor, useAuth } from '../../hooks/useAuth.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useToast } from '../../hooks/useToast.js';

const FIELDS = [
    { name: 'nombre', label: 'Nombre', required: true },
    { name: 'apellido', label: 'Apellido', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'tunombre@mail.com' },
    {
        name: 'password',
        label: 'Contraseña',
        type: 'password',
        required: true,
        hint: 'Mínimo 8 caracteres.',
        validate: (value) => (String(value).length < 8 ? 'Tiene que tener al menos 8 caracteres' : null),
    },
    { name: 'telefono', label: 'Teléfono (opcional)', hint: 'Con código de área.' },
    {
        name: 'fechaNacimiento',
        label: 'Fecha de nacimiento (opcional)',
        type: 'date',
        validate: (value) => (value > new Date().toISOString().slice(0, 10) ? 'La fecha no puede ser futura' : null),
    },
];

const NEXT_STEPS = [
    ['Entrás a tu cuenta', 'Apenas te registrás, ya sos parte del club.'],
    ['Elegís tus disciplinas', 'Mirás horarios y cupo, y pedís tu lugar.'],
    ['El club te confirma', 'Te avisamos en tu cuenta cuando tu lugar esté listo.'],
];

export default function Registro() {
    useDocumentTitle('Asociate');
    const { user, register } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (user) return <Navigate to={homeFor(user)} replace />;

    const submit = async (values) => {
        setSubmitting(true);
        setError('');
        try {
            const sessionUser = await register(values);
            toast.success(`¡Te damos la bienvenida, ${sessionUser.nombre}!`);
            navigate('/socio', { replace: true });
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    return (
        <AuthShell
            title="Sumate al club"
            lead="Creá tu cuenta en un minuto. Es gratis y no necesitás tarjeta."
            aside={(
                <div className="auth-next">
                    <h2>¿Qué pasa después?</h2>
                    <ol>
                        {NEXT_STEPS.map(([title, text]) => (
                            <li key={title}><strong>{title}</strong><span>{text}</span></li>
                        ))}
                    </ol>
                </div>
            )}
        >
            {error && <p className="form-error" role="alert">{error}</p>}
            <ResourceForm
                fields={FIELDS}
                initialValues={Object.fromEntries(FIELDS.map((field) => [field.name, '']))}
                submitLabel="Crear mi cuenta"
                submitting={submitting}
                onSubmit={submit}
                block
                showLegend
            />
            <p className="auth-card__switch">
                ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
            </p>
        </AuthShell>
    );
}
