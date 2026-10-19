import { Link } from 'react-router-dom';
import { StartArt } from '../../assets/illustrations/EmptyArt.jsx';
import Icon from '../ui/Icon.jsx';

/** Guía de primeros pasos para quien todavía no se inscribió en nada. */
export default function OnboardingSteps() {
    return (
        <section className="onboarding" aria-labelledby="primeros-pasos">
            <div className="onboarding__art"><StartArt /></div>
            <div className="onboarding__body">
                <h2 id="primeros-pasos">Tus primeros pasos en el club</h2>
                <p className="muted">Son tres, y el primero ya lo hiciste.</p>
                <ol className="onboarding__steps">
                    <li className="onboarding__step onboarding__step--done">
                        <span className="onboarding__dot" aria-hidden="true"><Icon name="check" size={16} strokeWidth={3} /></span>
                        <div>
                            <h3>Creaste tu cuenta</h3>
                            <p>Ya sos parte del club.</p>
                        </div>
                    </li>
                    <li className="onboarding__step onboarding__step--current" aria-current="step">
                        <span className="onboarding__dot" aria-hidden="true">2</span>
                        <div>
                            <h3>Elegí una disciplina</h3>
                            <p>Mirá los horarios y pedí tu lugar. El club te lo confirma.</p>
                            <Link to="/socio/disciplinas" className="btn btn--primary btn--sm">
                                Ver disciplinas <Icon name="arrow" size={16} />
                            </Link>
                        </div>
                    </li>
                    <li className="onboarding__step">
                        <span className="onboarding__dot" aria-hidden="true">3</span>
                        <div>
                            <h3>Pagá tu cuota</h3>
                            <p>Muy pronto vas a poder hacerlo desde acá. Mientras tanto, lo registramos en la administración.</p>
                        </div>
                    </li>
                </ol>
            </div>
        </section>
    );
}
