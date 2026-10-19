// Rutas públicas (sin sesión): solo datos comerciales para la página de inicio.

import { Router } from 'express';
import DisciplinaController from '../controllers/DisciplinaController.js';

const router = Router();

router.get('/disciplinas', DisciplinaController.getPublicas);

export default router;
