import { useEffect, useRef } from 'react';
import Icon from '../ui/Icon.jsx';

const ICONS = { success: 'check', error: 'alert', info: 'info' };

export default function ToastContainer({ toasts, onDismiss, onPause, onResume }) {
    const containerRef = useRef(null);

    // Se muestra como popover para quedar en la capa superior, por encima de los modales abiertos.
    // Solo se abre/cierra al aparecer el primero o salir el último: reabrirlo en cada cambio reiniciaría las transiciones.
    const hasToasts = toasts.length > 0;
    useEffect(() => {
        const container = containerRef.current;
        if (!container?.showPopover) return;
        const isOpen = container.matches(':popover-open');
        if (hasToasts && !isOpen) container.showPopover();
        if (!hasToasts && isOpen) container.hidePopover();
    }, [hasToasts]);

    return (
        <div
            ref={containerRef}
            popover="manual"
            className="toast-container"
            role="region"
            aria-label="Notificaciones"
            onMouseEnter={onPause}
            onMouseLeave={onResume}
            onFocus={onPause}
            onBlur={onResume}
        >
            {toasts.map((toast) => (
                // El contenedor "slot" colapsa su altura al salir, así los demás toasts se reacomodan sin saltar
                <div key={toast.id} className={`toast-slot ${toast.leaving ? 'toast-slot--leaving' : ''}`}>
                    <div className="toast-slot__inner">
                        <div
                            className={`toast toast--${toast.type} ${toast.leaving ? 'toast--leaving' : ''}`}
                            role={toast.type === 'error' ? 'alert' : 'status'}
                        >
                            <span className="toast__icon" aria-hidden="true">
                                <Icon name={ICONS[toast.type]} size={14} strokeWidth={2.5} />
                            </span>
                            <p className="toast__message">{toast.message}</p>
                            <button
                                type="button"
                                className="icon-button icon-button--sm"
                                onClick={() => onDismiss(toast.id)}
                                aria-label="Cerrar notificación"
                            >
                                <Icon name="x" size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
