import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { PaymentArt } from '../../assets/illustrations/EmptyArt.jsx';
import { MEDIOS_PAGO } from '../../utils/constants.js';
import { formatCurrency, formatPeriodLong } from '../../utils/formatters.js';

/**
 * Pago de una cuota: el socio elige el medio y confirma. El importe lo fija la cuota en el servidor.
 * No pide datos de tarjeta ni de cuenta; la página que lo usa llama a la API en `onConfirm(medioPago)`.
 */
export default function PagoModal({ cuota, open, busy, onConfirm, onClose, onExited }) {
    const [medio, setMedio] = useState('');

    return (
        <Modal
            title="Pagar mi cuota"
            open={open}
            dismissible={!busy}
            onClose={onClose}
            onExited={onExited}
            footer={(
                <>
                    <Button variant="ghost" onClick={onClose} disabled={busy}>Cancelar</Button>
                    <Button onClick={() => onConfirm(medio)} loading={busy} disabled={!medio}>
                        Confirmar pago
                    </Button>
                </>
            )}
        >
            <div className="pago">
                <PaymentArt />
                <p className="pago__summary">
                    <span>{formatPeriodLong(cuota.periodo)}</span>
                    <strong>{formatCurrency(cuota.monto)}</strong>
                </p>
                <fieldset className="pago__methods" disabled={busy}>
                    <legend>¿Cómo querés pagar?</legend>
                    {MEDIOS_PAGO.map((metodo, index) => (
                        <label key={metodo.id} className="pago__method">
                            <input
                                type="radio"
                                name="medioPago"
                                value={metodo.id}
                                checked={medio === metodo.id}
                                onChange={() => setMedio(metodo.id)}
                                data-autofocus={index === 0 ? '' : undefined}
                            />
                            <Icon name={metodo.icon} size={20} />
                            <span>{metodo.label}</span>
                        </label>
                    ))}
                </fieldset>
            </div>
        </Modal>
    );
}
