import { useState } from 'react';
import PageIntro from '../../components/socio/PageIntro.jsx';
import Reveal from '../../components/socio/Reveal.jsx';
import ResourceForm from '../../components/ResourceForm.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useDialog } from '../../hooks/useDialog.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useToast } from '../../hooks/useToast.js';
import { requestClubWithdrawal, updateProfile } from '../../services/miClubService.js';
import { formatDate, fullName, initials } from '../../utils/formatters.js';

const FIELDS = [
    { name: 'nombre', label: 'Nombre', required: true },
    { name: 'apellido', label: 'Apellido', required: true },
    { name: 'telefono', label: 'Teléfono', hint: 'Con código de área, así el club puede avisarte si hay cambios.' },
    {
        name: 'fechaNacimiento',
        label: 'Fecha de nacimiento',
        type: 'date',
        validate: (value) => (value > new Date().toISOString().slice(0, 10) ? 'La fecha no puede ser futura' : null),
    },
];

export default function Perfil() {
    useDocumentTitle('Perfil');
    const { user, setUser } = useAuth();
    const toast = useToast();
    const withdrawal = useDialog();
    const [saving, setSaving] = useState(false);
    const [busy, setBusy] = useState(false);

    const initialValues = Object.fromEntries(FIELDS.map((field) => [field.name, user[field.name] ?? '']));

    const save = async (values) => {
        setSaving(true);
        try {
            setUser(await updateProfile(values));
            toast.success('Guardamos tus datos.');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const confirmWithdrawal = async () => {
        setBusy(true);
        try {
            setUser(await requestClubWithdrawal());
            withdrawal.hide();
            toast.success('Recibimos tu pedido de baja. El club se va a comunicar con vos.');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <PageIntro title="Tu perfil" lead="Mantené tus datos al día para que el club pueda contactarte." />

            <div className="perfil-grid">
                <Reveal>
                    <section className="soft-card">
                        <div className="perfil-head">
                            <span className="avatar" aria-hidden="true">{initials(user)}</span>
                            <div>
                                <h2>{fullName(user)}</h2>
                                <p className="muted">
                                    Socio N.º {user.numeroSocio} · desde el {formatDate(user.fechaAlta)}
                                </p>
                                <p className="muted">{user.email}</p>
                            </div>
                        </div>
                        <ResourceForm
                            fields={FIELDS}
                            initialValues={initialValues}
                            submitLabel="Guardar cambios"
                            submitting={saving}
                            onSubmit={save}
                            showLegend={false}
                        />
                    </section>
                </Reveal>

                <Reveal delay={80}>
                    <section className="soft-card soft-card--quiet">
                        <h2>Baja del club</h2>
                        {user.fechaBajaSolicitada ? (
                            <>
                                <p><Badge variant="warning">Pedida el {formatDate(user.fechaBajaSolicitada)}</Badge></p>
                                <p className="muted">
                                    Ya recibimos tu pedido. La administración del club lo procesa y se comunica con vos.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="muted">
                                    Si ya no querés ser parte del club, podés pedir tu baja. No se borra nada de inmediato:
                                    el club revisa tu pedido y se comunica con vos.
                                </p>
                                <Button variant="danger-outline" onClick={() => withdrawal.show()}>Pedir la baja del club</Button>
                            </>
                        )}
                    </section>
                </Reveal>
            </div>

            {withdrawal.target && (
                <ConfirmDialog
                    title="Pedir la baja del club"
                    message="¿Seguro que querés dejar el club? Mientras el pedido esté en trámite no vas a poder inscribirte en nuevas disciplinas."
                    confirmLabel="Sí, pedir la baja"
                    open={withdrawal.open}
                    loading={busy}
                    onConfirm={confirmWithdrawal}
                    onCancel={withdrawal.hide}
                    onExited={withdrawal.reset}
                />
            )}
        </>
    );
}
