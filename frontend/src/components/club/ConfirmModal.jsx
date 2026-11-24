import { useState } from 'react';
import ClubModal from './ClubModal.jsx';

/** Confirmación de una baja (de una disciplina o del club). `onConfirm` devuelve una promesa. */
export default function ConfirmModal({ title, message, confirmLabel = 'Sí, pedir la baja', open, onClose, onExited, onConfirm }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const confirm = async () => {
        setBusy(true);
        setError('');
        try {
            await onConfirm();
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    };

    return (
        <ClubModal open={open} onClose={onClose} onExited={onExited} label={title} busy={busy}>
            <div className="c-modal__pad c-modal__pad--sm">
                <h2 className="c-modal__title">{title}</h2>
                <p className="c-muted" style={{ fontSize: 16, lineHeight: 1.55 }}>{message}</p>
                {error && <p className="c-error" role="alert">{error}</p>}
                <div className="c-modal__foot" style={{ border: 0, paddingTop: 0 }}>
                    <button type="button" className="c-btn c-btn--md c-btn--quiet" onClick={onClose} disabled={busy}>Cancelar</button>
                    <button type="button" className="c-btn c-btn--md c-btn--danger" onClick={confirm} disabled={busy}>
                        {busy ? 'Enviando…' : confirmLabel}
                    </button>
                </div>
            </div>
        </ClubModal>
    );
}
