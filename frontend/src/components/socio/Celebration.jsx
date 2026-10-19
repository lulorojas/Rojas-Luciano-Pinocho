import { useEffect } from 'react';
import Icon from '../ui/Icon.jsx';

const COLORS = ['#f5a30a', '#d9582b', '#0c6b4e', '#58bad8', '#ffd36b', '#7fb28d'];
const PIECES = 26;

// Reparto determinista (sin Math.random en el render): cada pieza sale en un ángulo distinto
const pieces = Array.from({ length: PIECES }, (_, index) => {
    const angle = (index / PIECES) * Math.PI * 2 + (index % 3) * 0.2;
    const distance = 90 + ((index * 37) % 70);
    return {
        key: index,
        style: {
            '--x': `${Math.cos(angle) * distance}px`,
            '--y': `${Math.sin(angle) * distance - 30}px`,
            '--r': `${(index * 83) % 360}deg`,
            '--delay': `${(index % 6) * 25}ms`,
            background: COLORS[index % COLORS.length],
        },
        round: index % 3 === 0,
    };
});

/** Celebración breve (≈1,4 s) al lograr algo importante. Con movimiento reducido queda solo el sello. */
export default function Celebration({ message, onDone }) {
    useEffect(() => {
        const timer = setTimeout(onDone, 1900);
        return () => clearTimeout(timer);
    }, [onDone]);

    return (
        <div className="celebration" aria-hidden="true">
            <div className="celebration__stage">
                <span className="celebration__badge">
                    <Icon name="check" size={34} strokeWidth={3} />
                </span>
                {pieces.map((piece) => (
                    <i
                        key={piece.key}
                        className={`celebration__piece ${piece.round ? 'celebration__piece--round' : ''}`}
                        style={piece.style}
                    />
                ))}
                <p className="celebration__message">{message}</p>
            </div>
        </div>
    );
}
