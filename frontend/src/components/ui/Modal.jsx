import { useEffect, useId, useRef } from 'react';
import Icon from './Icon.jsx';
import { getExitMs } from '../../utils/motion.js';

/**
 * Diálogo modal basado en <dialog>: el navegador atrapa el foco, cierra con Esc
 * y vuelve inerte el resto de la página.
 *
 * Es controlado por `open`: al pasar a false anima la salida y luego llama a
 * `onExited` para que el padre lo desmonte. Cualquier cierre (Cancelar, Guardar,
 * Esc, ×) pasa por ese mismo camino, y volver a abrirlo durante la salida lo revierte.
 *
 * - dismissible=false ignora Esc, × y clic en el fondo (p. ej. mientras se guarda).
 * - closeOnBackdrop=false evita perder un formulario a medio completar por un clic suelto.
 */
export default function Modal({
    title,
    open = true,
    dismissible = true,
    closeOnBackdrop = true,
    onClose,
    onExited,
    children,
    footer,
}) {
    const dialogRef = useRef(null);
    const onExitedRef = useRef(onExited);
    const titleId = useId();

    useEffect(() => {
        onExitedRef.current = onExited;
    });

    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) {
            dialog.showModal();
            // showModal enfoca el primer control (la ×); el foco útil es el campo o la acción segura
            dialog.querySelector('[data-autofocus]')?.focus({ preventScroll: true });
        }
        return () => dialog?.close();
    }, []);

    useEffect(() => {
        if (open) return undefined;
        const timer = setTimeout(() => onExitedRef.current?.(), getExitMs());
        return () => clearTimeout(timer);
    }, [open]);

    const requestClose = () => {
        if (open && dismissible) onClose?.();
    };

    const handleCancel = (event) => {
        event.preventDefault();
        requestClose();
    };

    // Clic sobre el fondo (el <dialog> en sí, no su contenido)
    const handleBackdropClick = (event) => {
        if (closeOnBackdrop && event.target === dialogRef.current) requestClose();
    };

    return (
        <dialog
            ref={dialogRef}
            className={`modal ${open ? '' : 'modal--closing'}`}
            aria-labelledby={titleId}
            onCancel={handleCancel}
            onClick={handleBackdropClick}
        >
            <div className="modal__content">
                <header className="modal__header">
                    <h2 id={titleId}>{title}</h2>
                    <button
                        type="button"
                        className="icon-button"
                        onClick={requestClose}
                        disabled={!dismissible}
                        aria-label="Cerrar"
                    >
                        <Icon name="x" size={18} />
                    </button>
                </header>
                <div className="modal__body">{children}</div>
                {footer && <footer className="modal__footer">{footer}</footer>}
            </div>
        </dialog>
    );
}
