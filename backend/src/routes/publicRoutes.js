// Rutas públicas (sin sesión): solo datos comerciales para el sitio del club.

import { Router } from 'express';
import DisciplinaController from '../controllers/DisciplinaController.js';
import { successResponse } from '../responses/apiResponse.js';
import { Club } from '../enums/Club.js';

const router = Router();

router.get('/disciplinas', DisciplinaController.getPublicas);

// Valores provisorios del club que el alta muestra en "Qué vas a pagar"
router.get('/club', (req, res) =>
    successResponse(res, { cuotaSocial: Club.CUOTA_SOCIAL, edadAdulta: Club.EDAD_ADULTA })
);

export default router;
