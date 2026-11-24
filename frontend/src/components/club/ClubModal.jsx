import { useEffect, useRef, useState } from 'react';

const EXIT_MS = 450;

/**
 * Ventana modal del club: overlay rgba(11,31,18,.5) con blur, panel blanco de radio 16 que entra con
 * translateY(24px) scale(.97) → none. Esc o tocar fuera la cierra (salvo mientras `busy`).
 * `open` pide abrir/cerrar; al terminar la animación de salida llama a `onExited` para desmontarla.
 */
export default function ClubModal({ open, onClose, onExited, label, busy = false, children }) {
    const [entered, setEntered] = useState(false);
    const panelRef = useRef(null);
    const closeRef = useRef(onClose);
    const busyRef = useRef(busy);
    // Esc usa siempre la última versión de onClose/busy sin volver a registrar el listener
    useEffect(() => {
        closeRef.current = onClose;
        busyRef.current = busy;
    });

    // Entrada: se monta cerrado y se abre en el cuadro siguiente para que la transición se vea
    useEffect(() => {
        const frame = requestAnimationFrame(() => setEntered(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    // Foco al panel, scroll de fondo bloqueado y Esc; todo se restaura al desmontar
    useEffect(() => {
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        panelRef.current?.focus({ preventScroll: true });
        const onKey = (event) => {
            if (event.key === 'Escape' && !busyRef.current) closeRef.current?.();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus?.({ preventScroll: true });
        };
    }, []);

    useEffect(() => {
        if (open) return undefined;
        const timer = setTimeout(() => onExited?.(), EXIT_MS);
        return () => clearTimeout(timer);
    }, [open, onExited]);

    return (
        <div
            className={`c-overlay ${entered && open ? 'is-open' : ''}`}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !busy) onClose?.();
            }}
        >
            <div ref={panelRef} className="c-modal" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
                {children}
            </div>
        </div>
    );
}
