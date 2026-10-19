import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { PaymentSoonArt } from '../../assets/illustrations/EmptyArt.jsx';
import { formatCurrency, formatPeriodLong } from '../../utils/formatters.js';

const METHODS = [
    { id: 'tarjeta', label: 'Tarjeta de crédito o débito', icon: 'card' },
    { id: 'transferencia', label: 'Transferencia bancaria', icon: 'arrow' },
    { id: 'billetera', label: 'Billetera virtual', icon: 'lock' },
];

/**
 * Pantalla de pago. Todavía NO funciona: muestra las formas de pago previstas deshabilitadas y
 * explica qué hacer mientras tanto. No pide ningún dato de tarjeta ni de cuenta.
 */
export default function PagoModal({ cuota, open, onClose, onExited }) {
    return (
        <Modal
            title="Pagar mi cuota"
            open={open}
            onClose={onClose}
            onExited={onExited}
            footer={<Button onClick={onClose} data-autofocus>Entendido</Button>}
        >
            <div className="pago">
                <PaymentSoonArt />
                <p className="pago__summary">
                    <span>{formatPeriodLong(cuota.periodo)}</span>
                    <strong>{formatCurrency(cuota.monto)}</strong>
                </p>
                <p className="pago__lead">
                    Estamos terminando de conectar los pagos online. Mientras tanto, acercate a la administración
                    del club y te registramos el pago en el momento.
                </p>
                <ul className="pago__methods" aria-label="Formas de pago previstas">
                    {METHODS.map((method) => (
                        <li key={method.id}>
                            <button type="button" className="pago__method" disabled>
                                <Icon name={method.icon} size={20} />
                                <span>{method.label}</span>
                                <span className="status-pill status-pill--soon">Próximamente</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </Modal>
    );
}
