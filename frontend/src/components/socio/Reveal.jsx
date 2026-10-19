import { useEffect, useRef, useState } from 'react';

/**
 * Entrada suave al aparecer en pantalla (fundido + leve ascenso). Se dispara una sola vez.
 * `delay` (ms) escalona tarjetas hermanas; 40-60 ms entre una y otra alcanza.
 * Sin IntersectionObserver el contenido se muestra directamente.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...props }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');

    useEffect(() => {
        const node = ref.current;
        if (visible || !node) return undefined;
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                setVisible(true);
                observer.disconnect();
            }
        }, { rootMargin: '0px 0px -8% 0px' });
        observer.observe(node);
        return () => observer.disconnect();
    }, [visible]);

    return (
        <Tag
            ref={ref}
            className={`reveal ${visible ? 'reveal--visible' : ''} ${className}`}
            style={{ '--reveal-delay': `${delay}ms` }}
            {...props}
        >
            {children}
        </Tag>
    );
}
