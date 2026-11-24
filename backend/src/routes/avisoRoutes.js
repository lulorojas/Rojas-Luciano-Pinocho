// Rutas de Aviso: solo del socio, y solo ve los suyos (el service filtra por el usuario).

import { Router } from 'express';
import AvisoController from '../controllers/AvisoController.js';
import { requireRole } from '../middlewares/auth.js';
import { Roles } from '../enums/Roles.js';

const router = Router();

router.use(requireRole(Roles.SOCIO));

router.get('/', AvisoController.getAll);
router.post('/leer', AvisoController.marcarLeidos);

export default router;
