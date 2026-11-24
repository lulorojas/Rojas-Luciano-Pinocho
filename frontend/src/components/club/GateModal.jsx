import ClubModal from './ClubModal.jsx';
import escudo from '../../assets/club/escudo-pinocho.png';

/**
 * Lo que ve un visitante al tocar una acción privada. Nunca una pantalla vacía: explica qué falta
 * y ofrece hacerse socio o ingresar.
 */
export default function GateModal({ message = 'Para anotarte tenés que ser socio', open, onClose, onExited, onSocio, onLogin }) {
    return (
        <ClubModal open={open} onClose={onClose} onExited={onExited} label={message}>
            <div className="c-modal__pad" style={{ alignItems: 'flex-start' }}>
                <img src={escudo} alt="" width="52" height="58" style={{ display: 'block', objectFit: 'contain' }} />
                <h2 className="c-modal__title c-modal__title--lg">{message}</h2>
                <p className="c-sub" style={{ lineHeight: 1.55 }}>
                    Hacerte socio pide lo mínimo y lleva un par de minutos. Después te anotás desde tu panel.
                </p>
                <div className="c-actions">
                    <button type="button" className="c-btn c-btn--lg c-btn--hacete" onClick={onSocio}>Hacete socio</button>
                    <button type="button" className="c-btn c-btn--lg c-btn--outline" onClick={onLogin}>Ya soy socio</button>
                </div>
            </div>
        </ClubModal>
    );
}
