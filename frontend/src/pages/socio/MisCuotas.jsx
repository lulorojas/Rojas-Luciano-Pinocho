import PageIntro from '../../components/socio/PageIntro.jsx';
import CuotaCard from '../../components/socio/CuotaCard.jsx';
import PagoModal from '../../components/socio/PagoModal.jsx';
import Reveal from '../../components/socio/Reveal.jsx';
import { RelaxArt } from '../../assets/illustrations/EmptyArt.jsx';
import { useDialog } from '../../hooks/useDialog.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useMiClub } from '../../hooks/useMiClub.js';
import { useNow } from '../../hooks/useNow.js';
import { formatCurrency } from '../../utils/formatters.js';

const byDueDate = (a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento);

export default function MisCuotas() {
    useDocumentTitle('Mis cuotas');
    const club = useMiClub();
    const now = useNow();
    const pago = useDialog();

    const porPagar = club.cuotas.filter((cuota) => cuota.estado !== 'pagada').sort(byDueDate);
    const pagadas = club.cuotas.filter((cuota) => cuota.estado === 'pagada').sort((a, b) => byDueDate(b, a));
    const total = porPagar.reduce((sum, cuota) => sum + cuota.monto, 0);

    return (
        <>
            <PageIntro title="Mis cuotas" lead="Todo lo que pagaste y lo que falta, en un solo lugar." />

            {porPagar.length === 0 ? (
                <Reveal>
                    <section className="soft-card soft-card--center">
                        <RelaxArt />
                        <h2>Estás al día</h2>
                        <p className="muted">No tenés cuotas pendientes. ¡Gracias por ser parte del club!</p>
                    </section>
                </Reveal>
            ) : (
                <>
                    <Reveal>
                        <p className="debt-banner" role="status">
                            {porPagar.length === 1 ? 'Tenés 1 cuota por pagar' : `Tenés ${porPagar.length} cuotas por pagar`}
                            <strong>{formatCurrency(total)}</strong>
                        </p>
                    </Reveal>
                    <h2 className="section-title">Por pagar</h2>
                    <ul className="cuota-list">
                        {porPagar.map((cuota, index) => (
                            <Reveal as="li" key={cuota.id} delay={index * 50}>
                                <CuotaCard cuota={cuota} now={now} onPay={pago.show} />
                            </Reveal>
                        ))}
                    </ul>
                </>
            )}

            {pagadas.length > 0 && (
                <>
                    <h2 className="section-title">Historial de pagos</h2>
                    <ul className="cuota-list">
                        {pagadas.map((cuota, index) => (
                            <Reveal as="li" key={cuota.id} delay={index * 50}>
                                <CuotaCard cuota={cuota} now={now} onPay={pago.show} />
                            </Reveal>
                        ))}
                    </ul>
                </>
            )}

            <details className="help-box">
                <summary>¿Cómo pago mi cuota?</summary>
                <p>
                    El pago online está en camino y vas a poder hacerlo desde el botón <strong>Pagar</strong>.
                    Mientras tanto, acercate a la administración del club: te registramos el pago en el momento
                    y la cuota pasa a “Pagada” en esta pantalla.
                </p>
            </details>

            {pago.target && <PagoModal cuota={pago.target} open={pago.open} onClose={pago.hide} onExited={pago.reset} />}
        </>
    );
}
