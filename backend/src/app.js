import express from 'express';
import cors from 'cors';
import { requireAuth, requireRole, adminOrReadOnly } from './auth/middleware.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { createPublicRouter } from './routes/public.routes.js';
import {
    createMemberCuotasRouter,
    createMemberInscripcionesRouter,
    createPagosRouter,
    createProfileRouter,
} from './routes/member.routes.js';
import {
    disciplinasRouter,
    sociosRouter,
    profesoresRouter,
    horariosRouter,
    inscripcionesRouter,
    cuotasRouter,
} from './routes/resources.js';

/**
 * Arma la app Express. Control de acceso (resumen):
 * - /auth: público (login y registro de socios). /public: solo disciplinas activas, campos comerciales.
 * - /disciplinas, /horarios, /profesores: admin con CRUD, socio solo lectura.
 * - /socios: solo admin. /socios/me: solo socio, solo su perfil.
 * - /inscripciones y /cuotas: el socio solo ve y crea lo propio; el admin tiene todo.
 */
export function createApp() {
    const app = express();
    app.disable('x-powered-by');
    app.use(cors());
    app.use(express.json({ limit: '100kb' }));

    app.use('/auth', createAuthRouter());
    app.use('/public', createPublicRouter());

    app.use('/socios/me', requireAuth, requireRole('socio'), createProfileRouter());
    app.use('/socios', requireAuth, requireRole('admin'), sociosRouter);

    app.use('/disciplinas', requireAuth, adminOrReadOnly, disciplinasRouter);
    app.use('/horarios', requireAuth, adminOrReadOnly, horariosRouter);
    app.use('/profesores', requireAuth, adminOrReadOnly, profesoresRouter);

    app.use('/inscripciones', requireAuth, createMemberInscripcionesRouter(), inscripcionesRouter);
    app.use('/cuotas', requireAuth, createMemberCuotasRouter(), cuotasRouter);
    app.use('/pagos', requireAuth, createPagosRouter());

    app.use((req, res) => {
        res.status(404).json({ message: 'Ruta no encontrada' });
    });

    // Todos los errores se devuelven con el formato { message }
    app.use((err, req, res, next) => {
        if (err.type === 'entity.parse.failed') {
            return res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido' });
        }
        const status = err.status || 500;
        if (status === 500) console.error(err);
        res.status(status).json({ message: status === 500 ? 'Error interno del servidor' : err.message });
    });

    return app;
}
