// Rutas de Disciplina: solo define los endpoints y qué método del
// controller responde a cada uno. No tiene lógica propia.
// Lectura: cualquier usuario con sesión. Escritura: solo administrador.

import { Router } from 'express';
import DisciplinaController from '../controllers/DisciplinaController.js';
import { requireRole } from '../middlewares/auth.js';
import { Roles } from '../enums/Roles.js';

const router = Router();

router.get('/', DisciplinaController.getAll);
router.get('/:id', DisciplinaController.getById);
router.post('/', requireRole(Roles.ADMIN), DisciplinaController.create);
router.put('/:id', requireRole(Roles.ADMIN), DisciplinaController.update);
router.delete('/:id', requireRole(Roles.ADMIN), DisciplinaController.remove);

export default router;
