import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ToastProvider from './components/notifications/ToastProvider.jsx';
import AuthProvider from './context/AuthContext.jsx';
import RequireRole from './components/RequireRole.jsx';
import Layout from './components/layout/Layout.jsx';
import SocioLayout from './components/club/SocioLayout.jsx';
import Landing from './pages/public/Landing.jsx';
import Login from './pages/public/Login.jsx';
import Registro from './pages/public/Registro.jsx';
import Home from './pages/Home.jsx';
import Disciplinas from './pages/Disciplinas.jsx';
import Socios from './pages/Socios.jsx';
import Profesores from './pages/Profesores.jsx';
import Horarios from './pages/Horarios.jsx';
import Inscripciones from './pages/Inscripciones.jsx';
import Cuotas from './pages/Cuotas.jsx';
import Inicio from './pages/socio/Inicio.jsx';
import DisciplinasSocio from './pages/socio/Disciplinas.jsx';
import MiSemana from './pages/socio/MiSemana.jsx';
import MisCuotas from './pages/socio/MisCuotas.jsx';
import Perfil from './pages/socio/Perfil.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/ingresar" element={<Login />} />
                        <Route path="/login" element={<Navigate to="/ingresar" replace />} />
                        <Route path="/registro" element={<Registro />} />

                        {/* Panel de administración: solo rol admin */}
                        <Route path="/admin" element={<RequireRole role="admin" />}>
                            <Route element={<Layout />}>
                                <Route index element={<Home />} />
                                <Route path="disciplinas" element={<Disciplinas />} />
                                <Route path="socios" element={<Socios />} />
                                <Route path="profesores" element={<Profesores />} />
                                <Route path="horarios" element={<Horarios />} />
                                <Route path="inscripciones" element={<Inscripciones />} />
                                <Route path="cuotas" element={<Cuotas />} />
                                <Route path="*" element={<NotFound />} />
                            </Route>
                        </Route>

                        {/* Panel de socio: solo rol socio (sin sesión se muestra el gate sobre el sitio) */}
                        <Route path="/socio" element={<RequireRole role="socio" />}>
                            <Route element={<SocioLayout />}>
                                <Route index element={<Inicio />} />
                                <Route path="disciplinas" element={<DisciplinasSocio />} />
                                <Route path="semana" element={<MiSemana />} />
                                <Route path="cuotas" element={<MisCuotas />} />
                                <Route path="perfil" element={<Perfil />} />
                                <Route path="*" element={<NotFound />} />
                            </Route>
                        </Route>

                        <Route path="*" element={<main className="standalone"><NotFound /></main>} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </ToastProvider>
    );
}
