import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { useResource } from '../hooks/useResource.js';
import { useToast } from '../hooks/useToast.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getSocios } from '../services/sociosService.js';
import { getDisciplinas } from '../services/disciplinasService.js';
import { getProfesores } from '../services/profesoresService.js';
import { getHorarios } from '../services/horariosService.js';
import { getCuotas, updateCuota } from '../services/cuotasService.js';
import { getInscripciones, scheduleTrial, updateInscripcion } from '../services/inscripcionesService.js';
import { DIAS_SEMANA } from '../utils/constants.js';
import { formatCurrency, formatPeriod, fullName } from '../utils/formatters.js';

const MAX_ATTENTION_ITEMS = 6;

// Sábado próximo a las 10:00 (al menos 2 días adelante): fecha sugerida al agendar una prueba
function suggestedTrial() {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    while (date.getDay() !== 6) date.setDate(date.getDate() + 1);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T10:00`;
}

// Date.getDay(): 0 = domingo. DIAS_SEMANA empieza en lunes.
const todayName = () => DIAS_SEMANA[(new Date().getDay() + 6) % 7];

const todayLabel = () => new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    .format(new Date());

export default function Home() {
    useDocumentTitle('Inicio');
    const toast = useToast();

    const load = useCallback(async () => {
        const [socios, disciplinas, profesores, horarios, cuotas, inscripciones] = await Promise.all([
            getSocios(),
            getDisciplinas(),
            getProfesores(),
            getHorarios(),
            getCuotas(),
            getInscripciones(),
        ]);
        return { socios, disciplinas, profesores, horarios, cuotas, inscripciones };
    }, []);
    const { data, loading, error, reload } = useResource(load);

    const resolve = async (operation, message) => {
        try {
            await operation();
            toast.success(message);
            reload();
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading && !data) {
        return (
            <>
                <PageHeader title="Inicio" description={todayLabel()} />
                <Spinner label="Cargando resumen…" />
            </>
        );
    }
    if (error && !data) {
        return (
            <>
                <PageHeader title="Inicio" description={todayLabel()} />
                <ErrorState message={error} onRetry={reload} />
            </>
        );
    }

    const socioName = (id) => fullName(data.socios.find((socio) => socio.id === id));
    const disciplinaName = (id) => data.disciplinas.find((disciplina) => disciplina.id === id)?.nombre ?? '—';

    const todayIso = new Date().toISOString().slice(0, 10);
    const pendingInscripciones = data.inscripciones.filter((i) => ['SOLICITADA', 'PRUEBA_SOLICITADA'].includes(i.estado));
    const isOverdue = (c) => c.estado === 'vencida' || (c.estado !== 'pagada' && c.fechaVencimiento < todayIso);
    const overdueCuotas = data.cuotas.filter(isOverdue);
    const pendingCuotas = data.cuotas.filter((c) => c.estado !== 'pagada' && !isOverdue(c));

    // Lo que requiere una acción hoy: primero lo vencido, luego las altas por confirmar
    const attention = [
        ...overdueCuotas.map((cuota) => ({
            key: `cuota-${cuota.id}`,
            title: `${socioName(cuota.idSocio)} adeuda ${formatCurrency(cuota.monto)}`,
            detail: `Cuota ${formatPeriod(cuota.periodo)} vencida`,
            action: 'Registrar pago',
            run: () => resolve(() => updateCuota(cuota.id, { estado: 'pagada' }), 'Pago registrado correctamente'),
        })),
        ...pendingInscripciones.map((inscripcion) => ({
            key: `inscripcion-${inscripcion.id}`,
            title: `${socioName(inscripcion.idSocio)} quiere sumarse a ${disciplinaName(inscripcion.idDisciplina)}`,
            detail: inscripcion.estado === 'PRUEBA_SOLICITADA' ? 'Pidió una prueba: falta agendarla' : 'Inscripción pendiente de confirmación',
            action: inscripcion.estado === 'PRUEBA_SOLICITADA' ? 'Agendar prueba' : 'Confirmar',
            run: () => (inscripcion.estado === 'PRUEBA_SOLICITADA'
                ? resolve(() => scheduleTrial(inscripcion.id, suggestedTrial()), 'Prueba agendada para el próximo sábado a las 10:00')
                : resolve(() => updateInscripcion(inscripcion.id, { estado: 'ACTIVA' }), 'Inscripción confirmada correctamente')),
        })),
    ];

    const today = todayName();
    const classesToday = data.horarios
        .filter((horario) => horario.diaSemana === today)
        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

    const summary = [
        { label: 'Socios activos', value: data.socios.filter((s) => s.estado === 'activo').length, to: '/admin/socios' },
        { label: 'Disciplinas activas', value: data.disciplinas.filter((d) => d.activa).length, to: '/admin/disciplinas' },
        { label: 'Inscripciones pendientes', value: pendingInscripciones.length, to: '/admin/inscripciones?estado=SOLICITADA' },
        { label: 'Cuotas vencidas', value: overdueCuotas.length, to: '/admin/cuotas?estado=vencida' },
        { label: 'Cuotas pendientes', value: pendingCuotas.length, to: '/admin/cuotas?estado=pendiente' },
    ];

    const visibleAttention = attention.slice(0, MAX_ATTENTION_ITEMS);

    return (
        <>
            <PageHeader title="Inicio" description={todayLabel()} />

            <nav aria-label="Resumen del club">
                <ul className="summary">
                    {summary.map((item) => (
                        <li key={item.label}>
                            <Link to={item.to} className="summary__link">
                                <span className="summary__value">{item.value}</span>
                                <span className="summary__label">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="home-grid">
                <Card title="Requiere atención" className="home-grid__main">
                    {visibleAttention.length === 0 ? (
                        <p className="muted">Todo al día: no hay cuotas vencidas ni inscripciones por confirmar.</p>
                    ) : (
                        <ul className="attention">
                            {visibleAttention.map((item) => (
                                <li key={item.key} className="attention__item">
                                    <div>
                                        <p className="attention__title">{item.title}</p>
                                        <p className="attention__detail">{item.detail}</p>
                                    </div>
                                    <Button size="sm" variant="secondary" onClick={item.run}>{item.action}</Button>
                                </li>
                            ))}
                        </ul>
                    )}
                    {attention.length > MAX_ATTENTION_ITEMS && (
                        <p className="attention__more">
                            Y {attention.length - MAX_ATTENTION_ITEMS} más: revisá <Link to="/admin/cuotas?estado=vencida">cuotas</Link> e{' '}
                            <Link to="/admin/inscripciones?estado=SOLICITADA">inscripciones</Link>.
                        </p>
                    )}
                </Card>

                <Card title={`Clases de hoy · ${today}`}>
                    {classesToday.length === 0 ? (
                        <p className="muted">No hay clases programadas para hoy.</p>
                    ) : (
                        <ul className="agenda">
                            {classesToday.map((horario) => (
                                <li key={horario.id} className="agenda__item">
                                    <time className="agenda__time" dateTime={horario.horaInicio}>{horario.horaInicio}</time>
                                    <div>
                                        <p className="attention__title">{disciplinaName(horario.idDisciplina)}</p>
                                        <p className="attention__detail">
                                            {fullName(data.profesores.find((p) => p.id === horario.idProfesor))} · hasta {horario.horaFin}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </>
    );
}
