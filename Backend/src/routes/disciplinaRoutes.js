// Rutas de Disciplina: solo define los endpoints y qué método del
// controller responde a cada uno. No tiene lógica propia.

import { Router } from 'express';
import DisciplinaController from '../controllers/DisciplinaController.js';

const router = Router();

router.get('/', DisciplinaController.getAll);
router.get('/:id', DisciplinaController.getById);
router.post('/', DisciplinaController.create);
router.put('/:id', DisciplinaController.update);
router.delete('/:id', DisciplinaController.remove);

export default router;
