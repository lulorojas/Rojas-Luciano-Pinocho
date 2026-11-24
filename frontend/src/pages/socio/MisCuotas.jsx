import Reveal from '../../components/club/Reveal.jsx';
import { Badge } from '../../components/club/parts.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useMiClub } from '../../hooks/useMiClub.js';
import { useNow } from '../../hooks/useNow.js';
import {
    ESTADO_CUOTA,
    MEDIO_LABEL,
    artOf,
    concepto,
    estadoCuota,
    fdate,
    isoDate,
    mesCorto,
    money,
    periodoLabel,
} from '../../utils/club.js';

// Pendientes primero (por vencimiento); las pagadas después, de la más reciente a la más vieja
const ordenar = (a, b) => (a.estado === 'pagada') - (b.estado === 'pagada')
    || (a.estado === 'pagada' ? b.fechaVencimiento.localeCompare(a.fechaVencimiento) : a.fechaVencimiento.localeCompare(b.fechaVencimiento));

export default function MisCuotas() {
    useDocumentTitle('Mis cuotas');
    const club = useMiClub();
    const now = useNow();
    const hoy = isoDate(now);

    const pendientes = club.cuotas.filter((cuota) => cuota.estado !== 'pagada');
    const deuda = pendientes.reduce((suma, cuota) => suma + cuota.monto, 0);
    const sociales = club.cuotas.filter((cuota) => cuota.tipo === 'social').sort(ordenar);
    const deDisciplina = club.cuotas.filter((cuota) => cuota.tipo === 'disciplina').sort(ordenar);

    const fila = (cuota) => {
        const estado = estadoCuota(cuota, hoy);
        const [etiqueta, tono] = ESTADO_CUOTA[estado];
        const nombre = concepto(cuota, club.disciplinaById);
        const color = cuota.tipo === 'social' ? '#0a8a3a' : artOf(nombre).color;
        const detalle = estado === 'pagada'
            ? `Pagada el ${fdate(cuota.fechaPago)} · ${MEDIO_LABEL[cuota.medioPago] ?? 'Pago registrado'}`
            : `${estado === 'vencida' ? 'Venció el' : 'Vence el'} ${fdate(cuota.fechaVencimiento)}`;
        return (
            <li key={cuota.id} className="c-cuota">
                <span className="c-cuota__tile" style={{ background: color }}>{mesCorto(cuota.periodo)}</span>
                <span className="c-cuota__text">
                    <strong>{cuota.tipo === 'social' ? periodoLabel(cuota.periodo) : `${nombre} · ${periodoLabel(cuota.periodo)}`}</strong>
                    <span>{detalle}</span>
                </span>
                <span className="c-cuota__side">
                    <Badge tone={tono}>{etiqueta}</Badge>
                    <span className="c-cuota__amount">{money(cuota.monto)}</span>
                    {estado !== 'pagada' && (
                        <button type="button" className="c-btn c-btn--primary c-btn--sm" onClick={() => club.openModal({ type: 'pago', id: cuota.id })}>
                            Pagar
                        </button>
                    )}
                </span>
            </li>
        );
    };

    return (
        <div className="c-panel">
            <Reveal className="c-title">
                <h1 className="c-h1">Mis cuotas</h1>
                <p className="c-sub">La cuota social y, aparte, las cuotas de tus disciplinas. Montos de ejemplo, provisorios.</p>
            </Reveal>

            {pendientes.length > 0 ? (
                <Reveal index={1} as="p" className="c-bar" role="status">
                    <span>{pendientes.length === 1 ? 'Tenés 1 cuota por pagar' : `Tenés ${pendientes.length} cuotas por pagar`}</span>
                    <strong>{money(deuda)}</strong>
                </Reveal>
            ) : (
                <Reveal index={1} as="p" className="c-bar c-bar--ok">
                    <span><strong>Estás al día.</strong> No tenés cuotas por pagar.</span>
                </Reveal>
            )}

            <Reveal index={2} as="section" className="c-block" aria-labelledby="c-social">
                <div className="c-block__head">
                    <h2 id="c-social" className="c-h3">Cuota social</h2>
                    <p>Por ser socio del club. Se paga todos los meses.</p>
                </div>
                <ul className="c-cuotas">{sociales.map(fila)}</ul>
            </Reveal>

            <Reveal index={3} as="section" className="c-block" aria-labelledby="c-disc">
                <div className="c-block__head">
                    <h2 id="c-disc" className="c-h3">Cuotas por disciplina</h2>
                    <p>Solo las disciplinas que tienen cuota aparte, como natación.</p>
                </div>
                {deDisciplina.length > 0
                    ? <ul className="c-cuotas">{deDisciplina.map(fila)}</ul>
                    : <p className="c-empty" style={{ fontSize: 15, color: 'var(--club-muted)' }}>No tenés disciplinas con cuota aparte.</p>}
            </Reveal>

            <details className="c-details">
                <summary>¿Cómo pago mi cuota?</summary>
                <p>
                    Tocá <strong>Pagar</strong>, elegí cómo querés pagar y confirmá. El pago queda registrado al instante.
                    También podés acercarte a la administración del club.
                </p>
            </details>
        </div>
    );
}
