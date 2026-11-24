import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/club/AuthLayout.jsx';
import CarnetSocio from '../../components/club/CarnetSocio.jsx';
import { homeFor, useAuth } from '../../hooks/useAuth.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useThemeScope } from '../../hooks/useThemeScope.js';

const EMAIL = /^\S+@\S+\.\S+$/;
const DNI = /^\d{7,8}$/;

export default function Login() {
    useThemeScope('club');
    useDocumentTitle('Ingresar');
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ identificador: '', password: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (user) return <Navigate to={homeFor(user)} replace />;

    const change = (event) => {
        setForm((actual) => ({ ...actual, [event.target.name]: event.target.value }));
        setError('');
    };

    const submit = async (event) => {
        event.preventDefault();
        const identificador = form.identificador.trim();
        if (!identificador || !form.password) return setError('Completá tu email o DNI y tu contraseña.');
        const valido = identificador.includes('@') ? EMAIL.test(identificador) : DNI.test(identificador.replace(/\D/g, ''));
        if (!valido) return setError('Revisá el email o el DNI.');

        setSubmitting(true);
        try {
            const sessionUser = await login({ identificador, password: form.password });
            navigate(location.state?.from ?? homeFor(sessionUser), { replace: true });
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
        return undefined;
    };

    return (
        <AuthLayout
            aside={(
                <div className="c-auth__aside-in">
                    <CarnetSocio nombre="Tu nombre" numero="0000" desde="tu alta" />
                    <span className="c-lead-strong">Adentro tenés tu carnet, tus disciplinas, tu semana y tus cuotas.</span>
                </div>
            )}
        >
            <form className="c-auth__form" onSubmit={submit} noValidate>
                <div className="c-auth__intro">
                    <h1 className="c-h1">Ingresar</h1>
                    <p>Entrá a tu panel de socio.</p>
                </div>
                <label className="c-field">
                    Email o DNI
                    <input name="identificador" value={form.identificador} onChange={change} autoComplete="username" />
                </label>
                <label className="c-field">
                    Contraseña
                    <input name="password" type="password" value={form.password} onChange={change} autoComplete="current-password" />
                </label>
                {error && <p className="c-error" role="alert">{error}</p>}
                <button type="submit" className="c-btn c-btn--lg c-btn--primary" disabled={submitting}>
                    {submitting ? 'Ingresando…' : 'Ingresar'}
                </button>
                <p className="c-muted" style={{ fontSize: 15 }}>
                    ¿Todavía no sos socio? <Link to="/registro" className="c-linkbtn">Hacete socio</Link>
                </p>
            </form>
        </AuthLayout>
    );
}
