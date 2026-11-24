import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CarnetSocio from '../../components/club/CarnetSocio.jsx';
import DisciplinaCard from '../../components/club/DisciplinaCard.jsx';
import DisciplinaModal from '../../components/club/DisciplinaModal.jsx';
import GateModal from '../../components/club/GateModal.jsx';
import PublicHeader from '../../components/club/PublicHeader.jsx';
import Reveal from '../../components/club/Reveal.jsx';
import { Badge, CheckIcon } from '../../components/club/parts.jsx';
import { homeFor, useAuth } from '../../hooks/useAuth.js';
import { useDialog } from '../../hooks/useDialog.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useResource } from '../../hooks/useResource.js';
import { useThemeScope } from '../../hooks/useThemeScope.js';
import { getPublicDisciplinas } from '../../services/publicService.js';
import { CLUB } from '../../utils/club.js';
import { addIntent } from '../../utils/intent.js';
import escudo from '../../assets/club/escudo-pinocho.png';
import plantel from '../../assets/club/fotos/plantel-2024.png';
import festejo from '../../assets/club/fotos/festejo-campeonato.png';
import fachada from '../../assets/club/fotos/fachada-csyd.png';
import microestadio from '../../assets/club/fotos/microestadio-verde.png';

const BENEFICIOS = [
    ['Carnet digital', 'Tu número de socio y QR, siempre en el celular.'],
    ['Anotarte a disciplinas', 'Pedís tu lugar o tu prueba y seguís cada paso desde el panel.'],
    ['Tu semana', 'Tus horarios de entrenamiento, en una grilla.'],
    ['Cuotas online', 'Pagás con tarjeta, transferencia o billetera virtual.'],
];

const HECHOS = [
    ['14', true, 'Ligas de Primera División de Futsal AFA.', ' La última, en 2015.'],
    ['111', true, 'Partidos invicto.', ' La racha de La Máquina Verde.'],
    ['Copa Libertadores', false, 'Subcampeón', ' de la Copa Libertadores de Futsal.'],
    ['El clásico', false, 'Pinocho vs 17 de Agosto.', ' El partido del barrio.'],
];

const HISTORIA = [
    ['20 de julio de 1925', 'Nace el Pinocho Foot-Ball Club', 'Lo fundan un grupo de chicos liderados por Félix Zugasti, de 16 años.'],
    ['2015', 'Liga número 14', 'El último de sus 14 títulos de liga de Primera División de Futsal AFA.'],
    ['Diciembre de 2024', 'De Interés Social y Deportivo', 'Así lo declara la Legislatura Porteña.'],
    ['2025', 'Centenario', 'Pinocho cumple cien años como club de barrio. Presidente: Carlos Mango.'],
];

function Cabecera({ eyebrow, title, lead, id, orange = false }) {
    return (
        <Reveal className="c-section__head">
            <span className={`c-eyebrow ${orange ? 'c-eyebrow--orange' : ''}`}>{eyebrow}</span>
            <h2 id={id} className="c-h2">{title}</h2>
            {lead && <p className="c-lead" style={orange ? { color: 'rgba(255,255,255,.86)', maxWidth: 640 } : undefined}>{lead}</p>}
        </Reveal>
    );
}

/**
 * Sitio público: portada, cómo funciona, qué se gana siendo socio, disciplinas, futsal, historia y contacto.
 * Se puede ver todo sin ser socio; cualquier intento de anotarse abre el "gate". `gateMessage` abre el gate
 * de entrada (por ejemplo, al llegar a una ruta privada sin sesión).
 */
export default function Landing({ gateMessage = null }) {
    useThemeScope('club');
    useDocumentTitle('');
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data, loading, error, reload } = useResource(getPublicDisciplinas);
    const detalle = useDialog();
    const gate = useDialog();
    const [entradaAbierta, setEntradaAbierta] = useState(Boolean(gateMessage));

    // Un socio con sesión que toca "Anotarme" va a su panel: ahí se anota
    const anotarse = (disciplina) => {
        if (user) {
            navigate(user.rol === 'socio' ? '/socio/disciplinas' : homeFor(user));
            return;
        }
        addIntent(disciplina.id);
        gate.show('Para anotarte tenés que ser socio');
    };
    const irRegistro = () => navigate('/registro');
    const irLogin = () => navigate('/ingresar');

    const conPrueba = (data ?? []).filter((d) => d.tipoInscripcion === 'prueba');
    const directas = (data ?? []).filter((d) => d.tipoInscripcion !== 'prueba');

    const grupo = (titulo, texto, lista, ancho) => (
        <div className="c-group">
            <Reveal className="c-group__head">
                <h3 className="c-h3">{titulo}</h3>
                <p>{texto}</p>
            </Reveal>
            <div className={`c-cards ${ancho}`}>
                {lista.map((disciplina, index) => (
                    <Reveal key={disciplina.id} index={index}>
                        <DisciplinaCard
                            disciplina={disciplina}
                            onOpen={() => detalle.show(disciplina.id)}
                            onCta={() => anotarse(disciplina)}
                        />
                    </Reveal>
                ))}
            </div>
        </div>
    );

    const abierta = data?.find((d) => d.id === detalle.target);

    return (
        <div className="club">
            <a className="skip-link" href="#contenido">Saltar al contenido</a>
            <PublicHeader />

            <main id="contenido" className="c-page">
                <section aria-labelledby="hero-title" className="c-hero">
                    <div className="c-hero__inner">
                        <div className="c-hero__copy">
                            <img className="c-hero__shield" src={escudo} alt="Escudo del Club Social y Deportivo Pinocho" width="84" height="93" />
                            <span className="c-eyebrow" style={{ color: '#fff' }}>Club Social y Deportivo Pinocho · Villa Urquiza · Desde 1925</span>
                            <h1 id="hero-title" className="c-hero__title">La Máquina Verde</h1>
                            <p className="c-hero__text">
                                Cien años de futsal, barrio y socios en Villa Urquiza. Hacete socio de Los Verdes y elegí tu disciplina.
                            </p>
                            {!user && (
                                <div className="c-actions">
                                    <Link to="/registro" className="c-btn c-btn--lg c-btn--hacete">Hacete socio</Link>
                                    <Link to="/ingresar" className="c-btn c-btn--lg c-btn--outline-light">Ya soy socio</Link>
                                </div>
                            )}
                            {user && (
                                <div className="c-actions">
                                    <Link to={homeFor(user)} className="c-btn c-btn--lg c-btn--outline-light">Ir a mi cuenta</Link>
                                </div>
                            )}
                        </div>
                        <div className="c-photo c-photo--hero">
                            <img src={plantel} alt="Plantel 2024 de futsal del Club Pinocho con camisetas verdes" />
                        </div>
                    </div>
                </section>

                <section id="como" aria-labelledby="como-title" className="c-bg-paper">
                    <div className="c-section__inner">
                        <Cabecera eyebrow="Cómo funciona" title="Tres pasos para jugar en Pinocho" id="como-title" />
                        <ol className="c-steps">
                            <Reveal as="li" className="c-step">
                                <span className="c-step__n">1</span>
                                <h3 className="c-h3">Hacete socio</h3>
                                <p>Pedimos lo mínimo: nombre, DNI, fecha de nacimiento y un contacto. Si sos menor, también los datos de un adulto responsable.</p>
                            </Reveal>
                            <Reveal as="li" index={1} className="c-step">
                                <span className="c-step__n">2</span>
                                <h3 className="c-h3">Elegí tu disciplina</h3>
                                <p>
                                    Natación, patín, gimnasia y karate se anotan directo y el club confirma tu lugar.{' '}
                                    <strong>Futsal, básquet y vóley pasan antes por una prueba.</strong>
                                </p>
                            </Reveal>
                            <Reveal as="li" index={2} className="c-step">
                                <span className="c-step__n">3</span>
                                <h3 className="c-h3">Andá a la cancha</h3>
                                <p>Con tu lugar confirmado, mirás tus horarios en Mi semana y pagás tus cuotas online.</p>
                            </Reveal>
                        </ol>
                        <Reveal as="p" className="c-muted" style={{ fontSize: 16, lineHeight: 1.55, maxWidth: 760 }}>
                            <strong style={{ color: 'var(--club-ink)' }}>Cuotas:</strong> pagás la cuota social por ser socio y, aparte, la cuota de la
                            disciplina cuando corresponda (por ejemplo, natación). Montos, edades y qué disciplinas llevan prueba: a confirmar por el club.
                        </Reveal>
                    </div>
                </section>

                <section id="socio" aria-labelledby="socio-title" className="c-bg-ink">
                    <div className="c-section__inner c-section__inner--cols">
                        <Reveal style={{ display: 'flex', flexDirection: 'column', gap: 28, alignItems: 'flex-start' }}>
                            <div className="c-section__head">
                                <span className="c-eyebrow c-eyebrow--orange">Ser socio</span>
                                <h2 id="socio-title" className="c-h2">Qué ganás siendo socio</h2>
                            </div>
                            <ul className="c-benefits">
                                {BENEFICIOS.map(([titulo, texto]) => (
                                    <li key={titulo}>
                                        <CheckIcon />
                                        <span><strong>{titulo}</strong><span>{texto}</span></span>
                                    </li>
                                ))}
                            </ul>
                            {!user && <Link to="/registro" className="c-btn c-btn--lg c-btn--hacete">Hacete socio</Link>}
                        </Reveal>
                        <Reveal index={1} className="c-preview" aria-label="Vista previa del panel de socio con datos de ejemplo">
                            <div className="c-preview__head">
                                <span className="c-eyebrow" style={{ color: 'var(--club-ink)', letterSpacing: '0.1em' }}>Así se ve tu panel</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--club-muted)' }}>Vista previa · datos de ejemplo</span>
                            </div>
                            <CarnetSocio nombre="Tu nombre" numero="0000" desde="tu alta" />
                            <div className="c-preview__rows">
                                <div className="c-preview__row">
                                    <span><strong>Natación</strong><small>Lun y Mié · 18:00</small></span>
                                    <Badge tone="ok">A la cancha</Badge>
                                </div>
                                <div className="c-preview__row">
                                    <span><strong>Futsal</strong><small>Prueba el sábado · 10:00</small></span>
                                    <Badge tone="w">Prueba agendada</Badge>
                                </div>
                                <div className="c-preview__row">
                                    <span><strong>Cuota social</strong><small>Este mes</small></span>
                                    <Badge tone="w">Por pagar</Badge>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                <section id="disciplinas" aria-labelledby="disc-title" className="c-bg-white">
                    <div className="c-section__inner">
                        <Cabecera
                            eyebrow="Disciplinas"
                            title="Elegí tu deporte"
                            id="disc-title"
                            lead="Podés ver todo sin ser socio. Para anotarte, primero hacete socio. Horarios, cuotas y qué disciplinas llevan prueba son provisorios hasta que el club los confirme."
                        />
                        {loading && !data && <p className="c-spinner" role="status">Cargando disciplinas…</p>}
                        {error && !data && (
                            <div className="c-alert c-alert--error" role="alert">
                                {error}{' '}
                                <button type="button" className="c-linkbtn" onClick={reload}>Reintentar</button>
                            </div>
                        )}
                        {data && (
                            <>
                                {conPrueba.length > 0 && grupo('Con prueba', 'Pedís una prueba, el club te asigna una fecha y después te dice si quedaste, si no quedaste o si quedás en lista de espera.', conPrueba, 'c-cards--wide')}
                                {directas.length > 0 && grupo('Se anota directo', 'Te anotás y el club confirma tu lugar.', directas, '')}
                            </>
                        )}
                    </div>
                </section>

                <div className="c-stripe c-stripe--wide" aria-hidden="true" />

                <section id="futsal" aria-labelledby="futsal-title" className="c-bg-deep">
                    <div className="c-section__inner">
                        <Cabecera
                            eyebrow="Futsal · Disciplina estrella"
                            title="El club más ganador del futsal argentino"
                            id="futsal-title"
                            orange
                            lead="Con plantel masculino y femenino, Pinocho es el más ganador de la Primera División de Futsal AFA y semillero de la Selección Argentina."
                        />
                        <div className="c-section__inner--cols" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 48, alignItems: 'center' }}>
                            <Reveal className="c-photo c-photo--tall">
                                <img src={festejo} alt="Festejo de campeonato del plantel de futsal" />
                            </Reveal>
                            <Reveal as="dl" index={1} className="c-facts">
                                {HECHOS.map(([dato, numero, fuerte, resto]) => (
                                    <div key={dato}>
                                        <dt className={numero ? 'is-number' : ''}>{dato}</dt>
                                        <dd><strong>{fuerte}</strong>{resto}</dd>
                                    </div>
                                ))}
                            </Reveal>
                        </div>
                    </div>
                </section>

                <section id="historia" aria-labelledby="hist-title" className="c-bg-paper">
                    <div className="c-section__inner c-section__inner--cols c-section__inner--top">
                        <Reveal style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div className="c-section__head">
                                <span className="c-eyebrow">Historia · Centenario</span>
                                <h2 id="hist-title" className="c-h2">Cien años de Pinocho</h2>
                                <p className="c-lead">De un grupo de chicos del barrio en 1925 a un club con cien años de historia en Villa Urquiza.</p>
                            </div>
                            <div className="c-photo c-photo--wide">
                                <img src={fachada} alt="Fachada del club con el cartel C.S.y D. Pinocho" />
                            </div>
                        </Reveal>
                        <Reveal as="ol" index={1} className="c-timeline">
                            {HISTORIA.map(([fecha, titulo, texto]) => (
                                <li key={fecha}>
                                    <span className="c-timeline__date">{fecha}</span>
                                    <span className="c-timeline__title">{titulo}</span>
                                    <p>{texto}</p>
                                </li>
                            ))}
                        </Reveal>
                    </div>
                </section>

                <section id="contacto" aria-labelledby="contacto-title" className="c-bg-white">
                    <div className="c-section__inner c-section__inner--cols">
                        <Reveal style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                            <div className="c-section__head">
                                <span className="c-eyebrow">Barrio y contacto</span>
                                <h2 id="contacto-title" className="c-h2">Vení al club</h2>
                                <p className="c-lead">Un club de barrio en Villa Urquiza, con buffet propio y el clásico de siempre contra 17 de Agosto.</p>
                            </div>
                            <dl className="c-dl">
                                <dt>Dirección</dt><dd>{CLUB.direccion}, Villa Urquiza, CABA</dd>
                                <dt>Estadio</dt><dd>Don Ernesto “Pepe” Magriarella · 650 espectadores</dd>
                                <dt>WhatsApp</dt><dd><a href={CLUB.whatsapp} target="_blank" rel="noopener noreferrer">11-6508-4323</a></dd>
                                <dt>Instagram</dt><dd><a href={CLUB.instagram} target="_blank" rel="noopener noreferrer">@clubpinocho</a></dd>
                                <dt>Google</dt><dd>4,4 estrellas · más de 3.100 opiniones</dd>
                            </dl>
                            <div className="c-actions">
                                <a href={CLUB.whatsapp} target="_blank" rel="noopener noreferrer" className="c-btn c-btn--lg c-btn--primary">Escribinos por WhatsApp</a>
                                <a href={CLUB.maps} target="_blank" rel="noopener noreferrer" className="c-btn c-btn--lg c-btn--outline">Cómo llegar</a>
                            </div>
                        </Reveal>
                        <Reveal index={1} className="c-photo c-photo--square">
                            <img src={microestadio} alt="Microestadio del club" />
                        </Reveal>
                    </div>
                </section>
            </main>

            <footer className="c-footer">
                <div className="c-footer__inner">
                    <span>
                        <img src={escudo} alt="" width="32" height="36" style={{ display: 'block', objectFit: 'contain' }} />
                        Club Social y Deportivo Pinocho · Desde 1925
                    </span>
                    <span className="c-footer__links">
                        <a href={CLUB.instagram} target="_blank" rel="noopener noreferrer">@clubpinocho</a>
                        {!user && <Link to="/ingresar" className="c-footer__link" style={{ color: '#fff' }}>Ingresar</Link>}
                    </span>
                </div>
            </footer>

            {abierta && (
                <DisciplinaModal
                    visitor
                    disciplina={abierta}
                    open={detalle.open}
                    onClose={detalle.hide}
                    onExited={detalle.reset}
                    onHacete={() => {
                        addIntent(abierta.id);
                        irRegistro();
                    }}
                    onLogin={irLogin}
                />
            )}
            {gate.target && (
                <GateModal
                    message={gate.target}
                    open={gate.open}
                    onClose={gate.hide}
                    onExited={gate.reset}
                    onSocio={irRegistro}
                    onLogin={irLogin}
                />
            )}
            {gateMessage && (
                <GateModal
                    message={gateMessage}
                    open={entradaAbierta}
                    onClose={() => {
                        setEntradaAbierta(false);
                        navigate('/', { replace: true });
                    }}
                    onSocio={irRegistro}
                    onLogin={irLogin}
                />
            )}
        </div>
    );
}
