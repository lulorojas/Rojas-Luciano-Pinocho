import { useEffect, useState } from 'react';

/** Fecha actual que se refresca cada tanto (por defecto cada minuto), para cuentas regresivas. */
export function useNow(intervalMs = 60_000) {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), intervalMs);
        return () => clearInterval(timer);
    }, [intervalMs]);
    return now;
}
