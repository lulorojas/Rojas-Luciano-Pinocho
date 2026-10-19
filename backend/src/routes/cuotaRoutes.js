// Rutas de Cuota. Lectura: el socio solo ve las suyas (el service filtra); escritura: solo administrador.

import { Router } from 'express';
import CuotaController from '../controllers/CuotaController.js';
import { requireRole } from '../middlewares/auth.js';
import { Roles } from '../enums/Roles.js';

const router = Router();

router.get('/', CuotaController.getAll);
router.get('/:id', CuotaController.getById);
router.post('/', requireRole(Roles.ADMIN), CuotaController.create);
router.put('/:id', requireRole(Roles.ADMIN), CuotaController.update);
router.delete('/:id', requireRole(Roles.ADMIN), CuotaController.remove);

export default router;
