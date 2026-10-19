// Configuración de la aplicación Express: middlewares globales, montaje
// de rutas y manejo de errores. No levanta el servidor (eso lo hace
// index.js) para poder testear la app sin abrir un puerto.

import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

export function createApp() {
    const app = express();

    app.disable('x-powered-by');

    // El frontend (Vite) corre en otro puerto, así que el navegador exige CORS.
    app.use(cors());
    app.use(express.json({ limit: '100kb' }));

    app.use('/api', routes);

    // El 404 va después de las rutas: si ninguna matcheó, cae acá.
    app.use(notFoundHandler);

    // El manejador de errores se registra último: Express solo lo ejecuta
    // cuando algún middleware/controller anterior llama a next(error) o lanza una excepción.
    app.use(errorHandler);

    return app;
}

const app = createApp();

export default app;
