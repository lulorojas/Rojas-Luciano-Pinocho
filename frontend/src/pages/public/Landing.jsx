import { Link } from 'react-router-dom';
import HeroScene from '../../assets/illustrations/HeroScene.jsx';
import DisciplineArt from '../../assets/illustrations/DisciplineArt.jsx';
import { StartArt } from '../../assets/illustrations/EmptyArt.jsx';
import Reveal from '../../components/socio/Reveal.jsx';
import Icon from '../../components/ui/Icon.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import { homeFor, useAuth } from '../../hooks/useAuth.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useResource } from '../../hooks/useResource.js';
import { useThemeScope } from '../../hooks/useThemeScope.js';
import { getPublicDisciplinas } from '../../services/publicService.js';
import { disciplineKind } from '../../utils/disciplineKind.js';
import { formatCurrency } from '../../utils/formatters.js';
import logo from '../../assets/logo.svg';

const PROMISES = [
    'Elegís tus días y horarios',
    'El club confirma tu lugar antes de cualquier cuota',
    'Todo desde tu celular o tu compu',
];

const STEPS = [
    ['Creá tu cuenta', 'Lleva un minuto y no pedimos tarjeta. Solo tus datos básicos.'],
    ['Elegí tus disciplinas', 'Mirá horarios, profesores y cuántos lugares quedan, y pedí el tuyo.'],
    ['Entrená y seguí tu cuota', 'Tu semana y tus cuotas quedan a la vista. El pago online llega muy pronto.'],
];

export default function Landing() {
    useThemeScope('socio');
    useDocumentTitle('');
    const { user } = useAuth();
    const { data, loading, error, reload } = useResource(getPublicDisciplinas);

    return (
        <div className="landing">
            <a className="skip-link" href="#contenido">Saltar al contenido</a>

            <header className="landing-header">
                <Link to="/" className="socio-brand">
                    <img src={logo} alt="" width="38" height="38" />
                    <span>Club Pinocho</span>
                </Link>
                <nav className="landing-header__nav" aria-label="Secciones de la página">
                    <a href="#como">Cómo funciona</a>
                    <a href="#disciplinas">Disciplinas</a>
                </nav>
                <div className="landing-header__actions">
                    {user ? (
                        <Link to={homeFor(user)} className="btn btn--primary btn--md">Ir a mi cuenta</Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn--ghost btn--md">Ingresar</Link>
                            <Link to="/registro" className="btn btn--primary btn--md">Asociate</Link>
                        </>
                    )}
                </div>
            </header>

            <main id="contenido">
                <section className="hero" aria-labelledby="hero-title">
                    <div className="hero__copy">
                        <h1 id="hero-title">Tu lugar para moverte, jugar y sentirte bien</h1>
                        <p className="hero__lead">
                            Sumate al Club Pinocho: elegí tus disciplinas, mirá los horarios y seguí tus cuotas
                            desde un solo lugar.
                        </p>
                        <div className="hero__actions">
                            <Link to="/registro" className="btn btn--primary btn--lg">
                                Quiero asociarme <Icon name="arrow" size={18} />
                            </Link>
                            <Link to="/login" className="btn btn--secondary btn--lg">Ya soy socio</Link>
                        </div>
                        <ul className="hero__promises">
                            {PROMISES.map((promise) => (
                                <li key={promise}><Icon name="check" size={18} strokeWidth={2.5} />{promise}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="hero__art">
                        <HeroScene />
                    </div>
                </section>

                <section id="como" className="section" aria-labelledby="como-title">
                    <Reveal><h2 id="como-title" className="section__title">Empezar es fácil</h2></Reveal>
                    <ol className="steps">
                        {STEPS.map(([title, text], index) => (
                            <Reveal as="li" key={title} delay={index * 80} className="steps__item">
                                <span className="steps__number" aria-hidden="true">{index + 1}</span>
                                <h3>{title}</h3>
                                <p>{text}</p>
                            </Reveal>
                        ))}
                    </ol>
                </section>

                <section id="disciplinas" className="section" aria-labelledby="disciplinas-title">
                    <Reveal>
                        <h2 id="disciplinas-title" className="section__title">Qué podés hacer en el club</h2>
                        <p className="section__lead">Cada disciplina tiene su propio grupo, horarios y profesor.</p>
                    </Reveal>

                    {loading && !data && <Spinner label="Cargando disciplinas…" />}
                    {error && !data && <ErrorState message={error} onRetry={reload} />}
                    {data && (
                        <ul className="card-grid">
                            {data.map((disciplina, index) => (
                                <Reveal as="li" key={disciplina.id} delay={Math.min(index, 8) * 50}>
                                    <article className="discipline-card discipline-card--static">
                                        <div className="discipline-card__art">
                                            <DisciplineArt kind={disciplineKind(disciplina.nombre)} />
                                        </div>
                                        <div className="discipline-card__body">
                                            <h3 className="discipline-card__title">{disciplina.nombre}</h3>
                                            <p className="discipline-card__desc">{disciplina.descripcion}</p>
                                            <p className="discipline-card__foot">
                                                <span className="price">{formatCurrency(disciplina.cuotaMensual)} <small>por mes</small></span>
                                                <span className="muted">
                                                    {disciplina.cupoDisponible > 0 ? `${disciplina.cupoDisponible} lugares` : 'Sin cupo'}
                                                </span>
                                            </p>
                                        </div>
                                    </article>
                                </Reveal>
                            ))}
                        </ul>
                    )}
                </section>

                <Reveal as="section" className="cta-band" aria-labelledby="cta-title">
                    <div className="cta-band__art"><StartArt /></div>
                    <div>
                        <h2 id="cta-title">¿Listo para empezar?</h2>
                        <p>Creá tu cuenta y pedí tu lugar en la disciplina que más te guste.</p>
                        <Link to="/registro" className="btn btn--primary btn--lg">
                            Crear mi cuenta <Icon name="arrow" size={18} />
                        </Link>
                    </div>
                </Reveal>
            </main>

            <footer className="landing-footer">
                <p>© Club Pinocho · Una casa para moverte</p>
                <Link to="/login">Ingresar</Link>
            </footer>
        </div>
    );
}
