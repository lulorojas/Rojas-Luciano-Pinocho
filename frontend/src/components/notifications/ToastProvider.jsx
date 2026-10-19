import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ToastContext } from './ToastContext.js';
import ToastContainer from './ToastContainer.jsx';
import { getExitMs } from '../../utils/motion.js';

// Los errores duran más: hay que poder releerlos. Todos se pausan con el mouse o el foco encima.
const DURATION_MS = { success: 4000, info: 5000, error: 9000 };

/** Sistema único de notificaciones laterales para éxitos, errores e información. */
export default function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(1);
    const timers = useRef(new Map());
    const pending = useRef(new Map()); // id -> duración, para reprogramar al reanudar

    // Primero marca el toast como "saliendo" para que anime su salida y luego lo quita
    const dismiss = useCallback((id) => {
        clearTimeout(timers.current.get(id));
        timers.current.delete(id);
        pending.current.delete(id);
        setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
        setTimeout(() => {
            setToasts((current) => current.filter((toast) => toast.id !== id));
        }, getExitMs());
    }, []);

    const schedule = useCallback((id, ms) => {
        pending.current.set(id, ms);
        timers.current.set(id, setTimeout(() => dismiss(id), ms));
    }, [dismiss]);

    const pause = useCallback(() => {
        timers.current.forEach((timer) => clearTimeout(timer));
        timers.current.clear();
    }, []);

    const resume = useCallback(() => {
        pending.current.forEach((ms, id) => {
            if (!timers.current.has(id)) schedule(id, ms);
        });
    }, [schedule]);

    const notify = useCallback((type, message) => {
        const id = nextId.current++;
        setToasts((current) => [...current, { id, type, message }]);
        schedule(id, DURATION_MS[type]);
    }, [schedule]);

    useEffect(() => {
        const activeTimers = timers.current;
        return () => activeTimers.forEach((timer) => clearTimeout(timer));
    }, []);

    const api = useMemo(() => ({
        success: (message) => notify('success', message),
        error: (message) => notify('error', message),
        info: (message) => notify('info', message),
    }), [notify]);

    return (
        <ToastContext.Provider value={api}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} onPause={pause} onResume={resume} />
        </ToastContext.Provider>
    );
}
