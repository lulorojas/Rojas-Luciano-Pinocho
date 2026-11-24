import { useState } from 'react';
import CarnetSocio from '../../components/club/CarnetSocio.jsx';
import Reveal from '../../components/club/Reveal.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useMiClub } from '../../hooks/useMiClub.js';
import { useToast } from '../../hooks/useToast.js';
import { updateProfile } from '../../services/miClubService.js';
import { desdeTxt, fdate, isoDate } from '../../utils/club.js';

const EMAIL = /^\S+@\S+\.\S+$/;

function Campo({ label, name, value, onChange, type = 'text', autoComplete }) {
    return (
        <label className="c-field">
            {label}
            <input name={name} type={type} value={value} onChange={onChange} autoComplete={autoComplete} />
        </label>
    );
}

export default function Perfil() {
    useDocumentTitle('Perfil');
    const { user, setUser } = useAuth();
    const club = useMiClub();
    const toast = useToast();
    const [form, setForm] = useState({
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono ?? '',
        email: user.email,
        fechaNacimiento: user.fechaNacimiento ?? '',
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const dado = Boolean(user.fechaBajaSolicitada);

    const change = (event) => {
        setForm((actual) => ({ ...actual, [event.target.name]: event.target.value }));
        setError('');
    };

    const submit = async (event) => {
        event.preventDefault();
        if (!form.nombre.trim() || !form.apellido.trim()) return setError('Nombre y apellido son obligatorios.');
        if (!EMAIL.test(form.email.trim())) return setError('Revisá el email.');
        if (form.fechaNacimiento && form.fechaNacimiento > isoDate(new Date())) return setError('La fecha no puede ser futura.');

        setSaving(true);
        try {
            setUser(await updateProfile({ ...form, email: form.email.trim() }));
            toast.success('Guardamos tus datos.');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
        return undefined;
    };

    const adulto = user.adultoResponsable;

    return (
        <div className="c-panel">
            <Reveal className="c-title">
                <h1 className="c-h1">Perfil</h1>
                <p className="c-sub">Mantené tus datos al día para que el club pueda contactarte.</p>
            </Reveal>

            <div className="c-split">
                <Reveal index={1} as="section" className="c-card c-card--grow-sm">
                    <dl className="c-perfil-dl">
                        <div><dt className="c-dt">Socio N.º</dt><dd>{user.numeroSocio}</dd></div>
                        <div><dt className="c-dt">DNI</dt><dd>{user.dni ? Number(user.dni).toLocaleString('es-AR') : '—'}</dd></div>
                        <div><dt className="c-dt">Alta</dt><dd>{fdate(user.fechaAlta)}</dd></div>
                    </dl>

                    <form className="c-form" onSubmit={submit} noValidate>
                        <div className="c-form__grid">
                            <Campo label="Nombre" name="nombre" value={form.nombre} onChange={change} autoComplete="given-name" />
                            <Campo label="Apellido" name="apellido" value={form.apellido} onChange={change} autoComplete="family-name" />
                            <Campo label="Celular" name="telefono" type="tel" value={form.telefono} onChange={change} autoComplete="tel" />
                            <Campo label="Email" name="email" type="email" value={form.email} onChange={change} autoComplete="email" />
                            <Campo label="Fecha de nacimiento" name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={change} />
                        </div>
                        {error && <p className="c-error" role="alert">{error}</p>}
                        <button type="submit" className="c-btn c-btn--md c-btn--primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>
                            {saving ? 'Guardando…' : 'Guardar cambios'}
                        </button>
                    </form>

                    {adulto && (
                        <div className="c-tutor">
                            <span className="c-dt">Adulto responsable</span>
                            <strong>{adulto.nombre}</strong>
                            <span>DNI {Number(adulto.dni).toLocaleString('es-AR')} · {adulto.celular}</span>
                        </div>
                    )}
                </Reveal>

                <div className="c-aside">
                    <Reveal index={2}>
                        <CarnetSocio
                            nombre={`${user.nombre} ${user.apellido}`}
                            numero={String(user.numeroSocio)}
                            desde={desdeTxt(user.fechaAlta)}
                            estado={dado ? 'Baja pedida' : 'Socio activo'}
                        />
                    </Reveal>
                    <Reveal index={3} as="section" className="c-card c-card--tight">
                        <h2 className="c-h3">Baja del club</h2>
                        {dado ? (
                            <p className="c-muted" style={{ fontSize: 15, lineHeight: 1.5 }}>
                                Pediste la baja el {fdate(user.fechaBajaSolicitada)}. La administración del club se comunica con vos.
                            </p>
                        ) : (
                            <>
                                <p className="c-muted" style={{ fontSize: 15, lineHeight: 1.5 }}>
                                    Si ya no querés ser socio, podés pedir la baja. El club revisa tu pedido y se comunica con vos.
                                </p>
                                <button type="button" className="c-btn c-btn--danger-outline" style={{ alignSelf: 'flex-start' }} onClick={() => club.openModal({ type: 'bajaClub' })}>
                                    Pedir la baja del club
                                </button>
                            </>
                        )}
                    </Reveal>
                </div>
            </div>
        </div>
    );
}
