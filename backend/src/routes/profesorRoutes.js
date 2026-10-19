// Rutas de Profesor. Lectura: cualquier usuario con sesión (el socio no recibe el teléfono).
// Escritura: solo administrador.

import { Router } from 'express';
import ProfesorController from '../controllers/ProfesorController.js';
import { requireRole } from '../middlewares/auth.js';
import { Roles } from '../enums/Roles.js';

const router = Router();

router.get('/', ProfesorController.getAll);
router.get('/:id', ProfesorController.getById);
router.post('/', requireRole(Roles.ADMIN), ProfesorController.create);
router.put('/:id', requireRole(Roles.ADMIN), ProfesorController.update);
router.delete('/:id', requireRole(Roles.ADMIN), ProfesorController.remove);

export default router;
