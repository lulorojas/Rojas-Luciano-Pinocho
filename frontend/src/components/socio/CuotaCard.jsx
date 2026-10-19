import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { daysUntil } from '../../utils/schedule.js';
import { formatCurrency, formatDate, formatPeriodLong } from '../../utils/formatters.js';

const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

// Estado en palabras simples + una frase que dice qué hacer (o que no hace falta hacer nada)
function describe(cuota, now) {
    if (cuota.estado === 'pagada') {
        return { tone: 'ok', tag: 'Pagada', text: `Pagaste el ${formatDate(cuota.fechaPago)}. ¡Gracias!` };
    }
    const days = daysUntil(cuota.fechaVencimiento, now);
    if (cuota.estado === 'vencida' || days < 0) {
        return { tone: 'late', tag: 'Vencida', text: `Venció hace ${plural(Math.abs(days), 'día', 'días')}. Podés ponerte al día cuando quieras.` };
    }
    if (days === 0) return { tone: 'soon', tag: 'Por pagar', text: 'Vence hoy.' };
    return { tone: 'soon', tag: 'Por pagar', text: `Vence el ${formatDate(cuota.fechaVencimiento)} · faltan ${plural(days, 'día', 'días')}.` };
}

export default function CuotaCard({ cuota, now, onPay }) {
    const info = describe(cuota, now);

    return (
        <article className={`cuota-card cuota-card--${info.tone}`}>
            <div className="cuota-card__main">
                <h3 className="cuota-card__period">{formatPeriodLong(cuota.periodo)}</h3>
                <p className="cuota-card__text">{info.text}</p>
            </div>
            <p className="cuota-card__amount">{formatCurrency(cuota.monto)}</p>
            <span className={`status-pill status-pill--${info.tone}`}>
                {info.tone === 'ok' && <Icon name="check" size={14} strokeWidth={3} />}
                {info.tag}
            </span>
            {cuota.estado !== 'pagada' && (
                <Button size="sm" onClick={() => onPay(cuota)}>
                    Pagar<span className="sr-only"> {formatPeriodLong(cuota.periodo)}</span>
                </Button>
            )}
        </article>
    );
}
