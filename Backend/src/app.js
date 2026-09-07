// Configuración de la aplicación Express: middlewares globales, montaje
// de rutas y manejo de errores. No levanta el servidor (eso lo hace
// index.js) para poder, en el futuro, testear la app sin abrir un puerto.

import express from 'express';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

app.use('/api', routes);

// El 404 va después de las rutas: si ninguna matcheó, cae acá.
app.use(notFoundHandler);

// El manejador de errores se registra último: Express solo lo ejecuta
// cuando algún middleware/controller anterior llama a next(error).
app.use(errorHandler);

export default app;
