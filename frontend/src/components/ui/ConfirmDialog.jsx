import Modal from './Modal.jsx';
import Button from './Button.jsx';

export default function ConfirmDialog({
    title,
    message,
    confirmLabel = 'Eliminar',
    variant = 'danger',
    open,
    loading = false,
    onConfirm,
    onCancel,
    onExited,
}) {
    return (
        <Modal
            title={title}
            open={open}
            dismissible={!loading}
            onClose={onCancel}
            onExited={onExited}
            footer={(
                <>
                    {/* El foco inicial cae en la opción segura, no en la destructiva */}
                    <Button variant="secondary" onClick={onCancel} disabled={loading} data-autofocus>
                        Cancelar
                    </Button>
                    <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
                </>
            )}
        >
            <p>{message}</p>
        </Modal>
    );
}
