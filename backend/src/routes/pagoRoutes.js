// Rutas de Pago. Los pagos online todavía no están disponibles: el endpoint responde 501.

import { Router } from 'express';
import PagoController from '../controllers/PagoController.js';

const router = Router();

router.post('/intentos', PagoController.crearIntento);

export default router;
