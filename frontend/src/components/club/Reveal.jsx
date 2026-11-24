import { useEffect, useRef, useState } from 'react';

/**
 * Aparición al hacer scroll: opacidad 0→1 y ascenso de 24 px, escalonada de a 70 ms.
 * Nunca oculta lo que ya se ve al cargar: solo se esconde lo que está por debajo de la pantalla.
 * Con "reducir movimiento" no hace nada (el CSS lo deja visible).
 */
export default function Reveal({ as: Tag = 'div', index = 0, className = '', children, ...props }) {
    const ref = useRef(null);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node || typeof IntersectionObserver === 'undefined') return undefined;
        if (node.getBoundingClientRect().top < window.innerHeight * 1.2) return undefined;

        setHidden(true);
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                setHidden(false);
                observer.disconnect();
            }
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <Tag
            ref={ref}
            className={`c-reveal ${hidden ? 'is-hidden' : ''} ${className}`}
            style={{ '--i': Math.min(index, 5) }}
            {...props}
        >
            {children}
        </Tag>
    );
}
