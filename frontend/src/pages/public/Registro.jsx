import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/club/AuthLayout.jsx';
import { Badge } from '../../components/club/parts.jsx';
import { homeFor, useAuth } from '../../hooks/useAuth.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useResource } from '../../hooks/useResource.js';
import { useThemeScope } from '../../hooks/useThemeScope.js';
import { useToast } from '../../hooks/useToast.js';
import { getClubInfo, getPublicDisciplinas } from '../../services/publicService.js';
import { edad, isoDate, money } from '../../utils/club.js';
import { clearIntent, getIntent } from '../../utils/intent.js';

// Valores provisorios por si el servidor todavía no respondió (el club los confirma)
const POR_DEFECTO = { cuotaSocial: 15000, edadAdulta: 18 };
const MIN_PASSWORD = 8;

const digitos = (texto) => texto.replace(/\D/g, '');
const VACIO = { nombre: '', apellido: '', dni: '', nac: '', cel: '', email: '', password: '', tNombre: '', tDni: '', tCel: '' };

const cargar = () => Promise.all([getPublicDisciplinas(), getClubInfo()]).then(([disciplinas, club]) => ({ disciplinas, club }));

function Campo({ label, name, value, onChange, error, type = 'text', autoComplete, inputMode, hint, hintTone }) {
    const mensaje = error || hint;
    return (
        <label className={`c-field ${error ? 'has-error' : ''}`}>
            {label}
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                inputMode={inputMode}
                aria-invalid={error ? true : undefined}
            />
            <span className={`c-field__msg ${error ? 'is-error' : hintTone === 'ok' ? 'is-ok' : ''}`}>{mensaje}</span>
        </label>
    );
}

/** "Hacete socio": pide lo mínimo y muestra a la derecha qué se va a pagar. */
export default function Registro() {
    useThemeScope('club');
    useDocumentTitle('Hacete socio');
    const { user, register } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const { data } = useResource(cargar);
    const [form, setForm] = useState(VACIO);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [intent] = useState(getIntent);

    const info = data?.club ?? POR_DEFECTO;
    const [hoy] = useState(() => isoDate(new Date()));
    const menor = Boolean(form.nac && form.nac <= hoy && edad(form.nac) < info.edadAdulta);

    const deInteres = useMemo(
        () => (data?.disciplinas ?? []).filter((d) => intent.includes(d.id)),
        [data, intent],
    );
    const conCuota = deInteres.filter((d) => d.cuotaAparte);

    if (user) return <Navigate to={homeFor(user)} replace />;

    const change = (event) => {
        const { name, value } = event.target;
        setForm((actual) => ({ ...actual, [name]: value }));
        setErrors((actual) => ({ ...actual, [name]: '' }));
        setSubmitError('');
    };

    const validar = () => {
        const err = {};
        if (!form.nombre.trim()) err.nombre = 'Completá tu nombre';
        if (!form.apellido.trim()) err.apellido = 'Completá tu apellido';
        if (!/^\d{7,8}$/.test(digitos(form.dni))) err.dni = 'DNI de 7 u 8 números';
        if (!form.nac) err.nac = 'Elegí tu fecha';
        else if (form.nac > hoy) err.nac = 'La fecha no puede ser futura';
        if (digitos(form.cel).length < 8) err.cel = 'Celular con código de área';
        if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) err.email = 'Ingresá un email válido';
        if (form.password.length < MIN_PASSWORD) err.password = `Mínimo ${MIN_PASSWORD} caracteres`;
        if (menor) {
            if (!form.tNombre.trim()) err.tNombre = 'Completá nombre y apellido';
            if (!/^\d{7,8}$/.test(digitos(form.tDni))) err.tDni = 'DNI de 7 u 8 números';
            if (digitos(form.tCel).length < 8) err.tCel = 'Celular con código de área';
        }
        return err;
    };

    const submit = async (event) => {
        event.preventDefault();
        const found = validar();
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSubmitting(true);
        setSubmitError('');
        try {
            await register({
                nombre: form.nombre.trim(),
                apellido: form.apellido.trim(),
                dni: digitos(form.dni),
                fechaNacimiento: form.nac,
                telefono: form.cel.trim(),
                email: form.email.trim(),
                password: form.password,
                adultoResponsable: menor
                    ? { nombre: form.tNombre.trim(), dni: digitos(form.tDni), celular: form.tCel.trim() }
                    : null,
                disciplinasInteres: intent,
            });
            clearIntent();
            toast.success('¡Listo! Ya sos socio de Pinocho.');
            navigate('/socio', { replace: true });
        } catch (err) {
            setSubmitError(err.message);
            setSubmitting(false);
        }
    };

    const campo = (name, label, extra = {}) => (
        <Campo label={label} name={name} value={form[name]} onChange={change} error={errors[name]} {...extra} />
    );
    const passwordOk = form.password.length >= MIN_PASSWORD;
    const totalMes = info.cuotaSocial + conCuota.reduce((suma, d) => suma + d.cuotaAparte, 0);

    return (
        <AuthLayout
            aside={(
                <div className="c-auth__aside-in" style={{ gap: 20 }}>
                    <h2>Qué vas a pagar</h2>
                    <div className="c-pay">
                        <div className="c-pay__row">
                            <span><strong>Cuota social</strong><small>Por ser socio, todos los meses.</small></span>
                            <span className="c-pay__amount">{money(info.cuotaSocial)}</span>
                        </div>
                        <div className="c-pay__sep">
                            <strong>Cuota por disciplina</strong>
                            <small>
                                Aparte, solo si te anotás en una que la tenga (por ejemplo, natación). Futsal, básquet y vóley: incluidas en la cuota social.
                            </small>
                        </div>
                        {conCuota.length > 0 && (
                            <>
                                <div className="c-pay__line"><span>Cuota social</span><span>{money(info.cuotaSocial)}</span></div>
                                {conCuota.map((d) => (
                                    <div key={d.id} className="c-pay__line"><span>{d.nombre}</span><span>+ {money(d.cuotaAparte)}</span></div>
                                ))}
                                <div className="c-pay__line c-pay__line--total"><span>Total por mes</span><span>{money(totalMes)}</span></div>
                            </>
                        )}
                        <Badge tone="provisorio" className="" size="">Montos de ejemplo · provisorios</Badge>
                    </div>
                    <span>
                        Las disciplinas las elegís después, desde tu panel. Las que llevan prueba no se activan hasta que el club te confirme que quedaste.
                    </span>
                </div>
            )}
        >
            <form className="c-auth__form c-auth__form--wide" onSubmit={submit} noValidate>
                <div className="c-auth__intro">
                    <span className="c-eyebrow">Alta de socio · Pedimos lo mínimo</span>
                    <h1 className="c-h1">Hacete socio</h1>
                    <p>Con tu alta ya podés anotarte en disciplinas, pagar tus cuotas y tener tu carnet.</p>
                </div>

                {deInteres.length > 0 && (
                    <p className="c-alert c-alert--info">
                        <strong>Querés sumarte a {deInteres.map((d) => d.nombre).join(' y ')}.</strong>{' '}
                        Para anotarte tenés que ser socio: completá esto y después lo pedís desde tu panel.
                    </p>
                )}

                <fieldset className="c-fieldset">
                    <legend>Tus datos</legend>
                    {campo('nombre', 'Nombre', { autoComplete: 'given-name' })}
                    {campo('apellido', 'Apellido', { autoComplete: 'family-name' })}
                    {campo('dni', 'DNI', { inputMode: 'numeric' })}
                    {campo('nac', 'Fecha de nacimiento', { type: 'date' })}
                </fieldset>

                <fieldset className="c-fieldset">
                    <legend>Contacto y acceso</legend>
                    {campo('cel', 'Celular', { type: 'tel', autoComplete: 'tel' })}
                    {campo('email', 'Email', { type: 'email', autoComplete: 'email' })}
                    {campo('password', 'Contraseña', {
                        type: 'password',
                        autoComplete: 'new-password',
                        hint: passwordOk ? 'Contraseña lista' : `Mínimo ${MIN_PASSWORD} caracteres`,
                        hintTone: passwordOk ? 'ok' : undefined,
                    })}
                </fieldset>

                {menor && (
                    <fieldset className="c-fieldset c-fieldset--tutor">
                        <legend>
                            <span>Adulto responsable</span>
                            <span>Como sos menor de {info.edadAdulta} años, necesitamos los datos de un adulto. Edad provisoria, a confirmar por el club.</span>
                        </legend>
                        {campo('tNombre', 'Nombre y apellido')}
                        {campo('tDni', 'DNI', { inputMode: 'numeric' })}
                        {campo('tCel', 'Celular', { type: 'tel' })}
                    </fieldset>
                )}

                {submitError && <p className="c-error" role="alert">{submitError}</p>}
                <button type="submit" className="c-btn c-btn--lg c-btn--hacete" disabled={submitting}>
                    {submitting ? 'Creando tu cuenta…' : 'Hacete socio'}
                </button>
                <p className="c-muted" style={{ fontSize: 15 }}>
                    ¿Ya sos socio? <Link to="/ingresar" className="c-linkbtn">Ingresar</Link>
                </p>
            </form>
        </AuthLayout>
    );
}
