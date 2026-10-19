// Rutas de Inscripcion. El socio ve y crea solo lo propio (el service filtra según el usuario);
// editar y borrar es del administrador. El socio puede pedir la baja de una inscripción suya.

import { Router } from 'express';
import InscripcionController from '../controllers/InscripcionController.js';
import { requireRole } from '../middlewares/auth.js';
import { Roles } from '../enums/Roles.js';

const router = Router();

router.get('/', InscripcionController.getAll);
router.get('/:id', InscripcionController.getById);
router.post('/', InscripcionController.create);
router.post('/:id/solicitar-baja', requireRole(Roles.SOCIO), InscripcionController.solicitarBaja);
router.put('/:id', requireRole(Roles.ADMIN), InscripcionController.update);
router.delete('/:id', requireRole(Roles.ADMIN), InscripcionController.remove);

export default router;
