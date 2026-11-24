import { useNavigate } from 'react-router-dom';
import CarnetSocio from '../../components/club/CarnetSocio.jsx';
import Reveal from '../../components/club/Reveal.jsx';
import { Badge, StepBar } from '../../components/club/parts.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useMiClub } from '../../hooks/useMiClub.js';
import { useNow } from '../../hooks/useNow.js';
import {
    EN_ESPERA,
    ESTADO,
    TIPO,
    TONO_BARRA,
    accionFor,
    artOf,
    concepto,
    desdeTxt,
    estadoCuota,
    faltaTxt,
    fdate,
    fechaPruebaTxt,
    hhmm,
    isoDate,
    money,
    nextOccurrence,
    stepsFor,
    whenLabel,
    cap,
} from '../../utils/club.js';
import { marcarVista } from '../../utils/novedades.js';

const unicos = (lista) => [...new Set(lista)];

export default function Inicio() {
    useDocumentTitle('Inicio');
    const { user } = useAuth();
    const club = useMiClub();
    const navigate = useNavigate();
    const now = useNow();
    const hoy = isoDate(now);

    const disciplina = (inscripcion) => club.disciplinaById.get(inscripcion.idDisciplina);
    const nombreDe = (inscripcion) => disciplina(inscripcion)?.nombre ?? 'la disciplina';
    const esPrueba = (inscripcion) => disciplina(inscripcion)?.tipoInscripcion === 'prueba';

    // ---- Para resolver (por prioridad) ----
    const pendientes = club.cuotas
        .filter((cuota) => cuota.estado !== 'pagada')
        .sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));
    const vencidas = pendientes.filter((cuota) => estadoCuota(cuota, hoy) === 'vencida');
    const porVencer = pendientes.filter((cuota) => estadoCuota(cuota, hoy) === 'pendiente');
    const detalleConcepto = (lista) => lista.map((cuota) => concepto(cuota, club.disciplinaById)).join(' + ');
    const total = (lista) => lista.reduce((suma, cuota) => suma + cuota.monto, 0);
    const pagar = (lista) => (lista.length === 1
        ? () => club.openModal({ type: 'pago', id: lista[0].id })
        : () => navigate('/socio/cuotas'));

    const acciones = [];
    club.abiertas.filter((i) => i.nuevo).forEach((inscripcion) => {
        const nombre = nombreDe(inscripcion);
        const visto = (despues) => async () => {
            await marcarVista(club, inscripcion.id);
            despues?.();
        };
        if (inscripcion.estado === 'ACTIVA') {
            acciones.push({
                ord: 0, tono: 'ok',
                titulo: esPrueba(inscripcion) ? `¡Quedaste en ${nombre}!` : `El club confirmó tu lugar en ${nombre}`,
                texto: 'Tu disciplina ya está activa y figura en Mi semana.',
                btn: 'Ver mi semana', go: visto(() => navigate('/socio/semana')),
            });
        } else if (inscripcion.estado === 'ESPERA') {
            acciones.push({
                ord: 0, tono: 'w', titulo: `Prueba de ${nombre}: quedaste en lista de espera`,
                texto: 'Te avisamos si se libera un lugar.', btn: 'Entendido', go: visto(),
            });
        } else if (inscripcion.estado === 'NO_QUEDO') {
            acciones.push({
                ord: 0, tono: 'bad', titulo: `Prueba de ${nombre}: esta vez no quedaste`,
                texto: 'Consultá al club por las próximas pruebas.', btn: 'Entendido', go: visto(),
            });
        }
    });
    if (vencidas.length) {
        acciones.push({
            ord: 1, tono: 'bad',
            titulo: vencidas.length === 1 ? 'Tenés una cuota vencida' : `Tenés ${vencidas.length} cuotas vencidas`,
            texto: `${detalleConcepto(vencidas)} · ${money(total(vencidas))}`,
            btn: 'Pagar', go: pagar(vencidas),
        });
    }
    club.abiertas.filter((i) => i.estado === 'PRUEBA_AGENDADA').forEach((inscripcion) => {
        acciones.push({
            ord: 2, tono: 'w',
            titulo: `Tu prueba de ${nombreDe(inscripcion)}: ${fechaPruebaTxt(inscripcion.fechaPrueba)}`,
            texto: 'Presentate en el club, Manuela Pedraza 5139. Fecha y lugar sujetos a confirmación del club.',
            btn: 'Ver detalle', go: () => club.openModal({ type: 'disc', id: inscripcion.idDisciplina }),
        });
    });
    if (porVencer.length) {
        acciones.push({
            ord: 3, tono: 'w',
            titulo: porVencer.length === 1 ? 'Tenés una cuota por vencer' : `Tenés ${porVencer.length} cuotas por vencer`,
            texto: `${detalleConcepto(porVencer)} · vence el ${fdate(porVencer[0].fechaVencimiento)} · ${money(total(porVencer))}`,
            btn: 'Pagar', go: pagar(porVencer),
        });
    }
    acciones.sort((a, b) => a.ord - b.ord);

    // ---- Mis disciplinas ----
    const vista = (inscripcion) => {
        const d = disciplina(inscripcion);
        const tipo = TIPO[d.tipoInscripcion] ?? TIPO.directa;
        return { inscripcion, d, tipo, estado: ESTADO[inscripcion.estado], color: artOf(d.nombre).color };
    };
    const activas = club.abiertas.filter((i) => i.estado === 'ACTIVA' || i.estado === 'BAJA_PENDIENTE').filter(disciplina).map(vista);
    const enEspera = club.abiertas.filter((i) => EN_ESPERA.includes(i.estado)).filter(disciplina).map(vista);
    const sinLugar = club.abiertas.filter((i) => i.estado === 'NO_QUEDO').filter(disciplina).map(vista);

    // ---- Próxima actividad: entrenamiento o prueba ----
    const eventos = [];
    club.abiertas.filter((i) => i.estado === 'ACTIVA').filter(disciplina).forEach((inscripcion) => {
        (disciplina(inscripcion).horarios ?? []).forEach((horario) => {
            eventos.push({ tipo: 'entreno', d: disciplina(inscripcion), horario, ...nextOccurrence(horario, now) });
        });
    });
    club.abiertas.filter((i) => i.estado === 'PRUEBA_AGENDADA' && i.fechaPrueba).filter(disciplina).forEach((inscripcion) => {
        const start = new Date(inscripcion.fechaPrueba);
        const end = new Date(start.getTime() + 90 * 60000);
        if (end > now) eventos.push({ tipo: 'prueba', d: disciplina(inscripcion), start, end, live: start <= now && now < end });
    });
    eventos.sort((a, b) => a.start - b.start);
    const proximo = eventos[0];

    const artProximo = proximo && (proximo.tipo === 'prueba'
        ? { fondo: 'linear-gradient(180deg,transparent 72%,#0a8a3a 72% 82%,transparent 82%),#ff7a2e', tinta: '#0b1f12' }
        : { fondo: artOf(proximo.d.nombre).art, tinta: '#ffffff' });

    return (
        <div className="c-panel">
            <Reveal className="c-title">
                <h1 className="c-h1">Hola, {user.nombre}</h1>
                <p className="c-sub">Socio N.º {user.numeroSocio} · {cap(new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(now))}</p>
            </Reveal>

            <Reveal index={1} as="section" className="c-block" aria-labelledby="resolver-title">
                <h2 id="resolver-title" className="c-h3">Para resolver</h2>
                {acciones.length > 0 ? (
                    <ul className="c-todo">
                        {acciones.map((accion) => (
                            <li key={`${accion.ord}-${accion.titulo}`} className="c-todo__item" style={{ '--tone': TONO_BARRA[accion.tono] }}>
                                <span className="c-todo__text">
                                    <strong>{accion.titulo}</strong>
                                    <span>{accion.texto}</span>
                                </span>
                                <button type="button" className="c-btn c-btn--primary" onClick={accion.go}>{accion.btn}</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="c-todo--empty"><strong>Todo en orden.</strong> No tenés respuestas nuevas ni cuotas por pagar.</p>
                )}
            </Reveal>

            <div className="c-split">
                <Reveal index={2} as="section" className="c-card c-card--grow" aria-labelledby="misdisc-title">
                    <h2 id="misdisc-title" className="c-h3">Mis disciplinas</h2>

                    {club.abiertas.length === 0 && (
                        <p className="c-muted" style={{ fontSize: 16, lineHeight: 1.55 }}>
                            Todavía no te anotaste en ninguna. Elegí una de inscripción directa o pedí una prueba.
                        </p>
                    )}

                    {activas.length > 0 && (
                        <div className="c-group-label">
                            <span>Activas</span>
                            {activas.map(({ inscripcion, d, estado, color }) => (
                                <button
                                    key={inscripcion.id}
                                    type="button"
                                    className="c-insc"
                                    style={{ '--edge': color }}
                                    onClick={() => club.openModal({ type: 'disc', id: d.id })}
                                >
                                    <span className="c-insc__text">
                                        <strong>{d.nombre}</strong>
                                        <span>{accionFor(inscripcion, d)}</span>
                                    </span>
                                    <Badge tone={estado[1]}>{estado[0]}</Badge>
                                </button>
                            ))}
                        </div>
                    )}

                    {enEspera.length > 0 && (
                        <div className="c-group-label c-group-label--wait">
                            <span>Esperando respuesta del club</span>
                            {enEspera.map(({ inscripcion, d, tipo, estado, color }) => (
                                <div key={inscripcion.id} className="c-insc c-insc--wait" style={{ '--edge': color }}>
                                    <div className="c-insc__head">
                                        <span className="c-insc__title">
                                            <strong>{d.nombre}</strong>
                                            <Badge tone={tipo.tone} size="sm">{tipo.label}</Badge>
                                        </span>
                                        <Badge tone={estado[1]}>{estado[0]}</Badge>
                                    </div>
                                    <StepBar steps={stepsFor(inscripcion, d)} />
                                    <span className="c-insc__next">{accionFor(inscripcion, d)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {sinLugar.length > 0 && (
                        <div className="c-group-label c-group-label--muted">
                            <span>Pruebas sin lugar</span>
                            {sinLugar.map(({ inscripcion, d, estado }) => (
                                <div key={inscripcion.id} className="c-insc">
                                    <span className="c-insc__text">
                                        <strong>{d.nombre}</strong>
                                        <span>{accionFor(inscripcion, d)}</span>
                                    </span>
                                    <Badge tone={estado[1]}>{estado[0]}</Badge>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="c-pickers">
                        <button type="button" className="c-picker c-picker--ok" onClick={() => navigate('/socio/disciplinas#grupo-directa')}>
                            <strong>Anotarme directo</strong>
                            <span>Natación, patín, gimnasia, karate</span>
                        </button>
                        <button type="button" className="c-picker c-picker--w" onClick={() => navigate('/socio/disciplinas#grupo-prueba')}>
                            <strong>Pedir una prueba</strong>
                            <span>Futsal, básquet, vóley</span>
                        </button>
                    </div>
                </Reveal>

                <aside className="c-aside">
                    {proximo && (
                        <Reveal index={2} as="section" className="c-next" aria-label="Próxima actividad">
                            <div className="c-next__art" style={{ background: artProximo.fondo, color: artProximo.tinta }}>
                                <small>{proximo.tipo === 'prueba' ? 'Tu próxima prueba' : 'Tu próximo entrenamiento'}</small>
                                <strong>{proximo.d.nombre}</strong>
                            </div>
                            <div className="c-next__body">
                                <span className="c-next__when">{whenLabel(proximo.start, now)} · {hhmm(proximo.start)}</span>
                                <span>
                                    {proximo.tipo === 'prueba'
                                        ? 'Fecha sujeta a confirmación del club.'
                                        : `${proximo.horario.horaInicio} a ${proximo.horario.horaFin} · Profe a confirmar`}
                                </span>
                                <span className="c-next__left">{proximo.live ? 'En curso ahora' : faltaTxt(proximo.start - now)}</span>
                            </div>
                        </Reveal>
                    )}

                    <Reveal index={3} as="section" className="c-card c-card--tight" aria-labelledby="cuotas-res">
                        <h2 id="cuotas-res" className="c-h3">Cuotas</h2>
                        {pendientes.length > 0 ? (
                            <>
                                <span className="c-debt">{money(total(pendientes))}</span>
                                <span className="c-muted" style={{ fontSize: 15 }}>
                                    {pendientes.length === 1 ? '1 cuota' : `${pendientes.length} cuotas`}: {unicos(pendientes.map((c) => concepto(c, club.disciplinaById))).join(' + ')}
                                </span>
                            </>
                        ) : (
                            <span style={{ fontSize: 17, fontWeight: 800, color: '#07702f' }}>Estás al día</span>
                        )}
                        <button type="button" className="c-linkbtn" style={{ alignSelf: 'flex-start', padding: '6px 0' }} onClick={() => navigate('/socio/cuotas')}>
                            Ver mis cuotas
                        </button>
                    </Reveal>

                    <Reveal index={4}>
                        <CarnetSocio
                            nombre={`${user.nombre} ${user.apellido}`}
                            numero={String(user.numeroSocio)}
                            desde={desdeTxt(user.fechaAlta)}
                            estado={user.fechaBajaSolicitada ? 'Baja pedida' : 'Socio activo'}
                        />
                    </Reveal>
                </aside>
            </div>
        </div>
    );
}
