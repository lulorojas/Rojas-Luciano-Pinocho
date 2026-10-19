// Rutas de Horario. Lectura: cualquier usuario con sesión. Escritura: solo administrador.

import { Router } from 'express';
import HorarioController from '../controllers/HorarioController.js';
import { requireRole } from '../middlewares/auth.js';
import { Roles } from '../enums/Roles.js';

const router = Router();

router.get('/', HorarioController.getAll);
router.get('/:id', HorarioController.getById);
router.post('/', requireRole(Roles.ADMIN), HorarioController.create);
router.put('/:id', requireRole(Roles.ADMIN), HorarioController.update);
router.delete('/:id', requireRole(Roles.ADMIN), HorarioController.remove);

export default router;
