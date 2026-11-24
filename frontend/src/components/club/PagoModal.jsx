import { useState } from 'react';
import ClubModal from './ClubModal.jsx';
import { CloseIcon } from './parts.jsx';
import { MEDIOS_PAGO, money, periodoLabel } from '../../utils/club.js';

/** Pago de una cuota: total + medio (tarjeta, transferencia, billetera). `onPay(medio)` devuelve una promesa. */
export default function PagoModal({ cuota, concepto, open, onClose, onExited, onPay }) {
    const [medio, setMedio] = useState('tarjeta');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const pay = async () => {
        setBusy(true);
        setError('');
        try {
            await onPay(medio);
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    };

    return (
        <ClubModal open={open} onClose={onClose} onExited={onExited} label={`Pagar ${concepto}`} busy={busy}>
            <div className="c-modal__pad c-modal__pad--sm" style={{ gap: 22 }}>
                <div className="c-modal__head-row" style={{ alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span className="c-dt" style={{ fontSize: 13, letterSpacing: '0.1em' }}>Pagar</span>
                        <h2 className="c-modal__title">{concepto} · {periodoLabel(cuota.periodo)}</h2>
                    </div>
                    <button type="button" className="c-close" onClick={onClose} aria-label="Cerrar" disabled={busy}><CloseIcon /></button>
                </div>

                <div className="c-total">
                    <span style={{ fontSize: 16 }}>Total a pagar</span>
                    <strong>{money(cuota.monto)}</strong>
                </div>

                <fieldset className="c-medios" role="radiogroup">
                    <legend>¿Cómo querés pagar?</legend>
                    {MEDIOS_PAGO.map(([id, label]) => (
                        <button
                            key={id}
                            type="button"
                            role="radio"
                            aria-checked={medio === id}
                            className="c-medio"
                            onClick={() => setMedio(id)}
                        >
                            <i aria-hidden="true" />
                            {label}
                        </button>
                    ))}
                </fieldset>

                {error && <p className="c-error" role="alert">{error}</p>}

                <div className="c-modal__foot" style={{ border: 0, paddingTop: 0 }}>
                    <button type="button" className="c-btn c-btn--md c-btn--quiet" onClick={onClose} disabled={busy}>Cancelar</button>
                    <button type="button" className="c-btn c-btn--md c-btn--primary" onClick={pay} disabled={busy}>
                        {busy ? 'Procesando…' : `Pagar ${money(cuota.monto)}`}
                    </button>
                </div>
            </div>
        </ClubModal>
    );
}
