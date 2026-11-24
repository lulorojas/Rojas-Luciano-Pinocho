// Rutas de Inscripcion. El socio ve y crea solo lo propio (el service filtra según el usuario);
// editar y borrar es del administrador. El socio puede pedir la baja de una inscripción suya.

import { Router } from 'express';
import InscripcionController from '../controllers/InscripcionController.js';
import { requireRole } from '../middlewares/auth.js';
import { Roles } from '../enums/Roles.js';

const router = Router();

router.get('/', InscripcionController.getAll);
// Va antes de /:id para que "superposiciones" no se tome como un id
router.get('/superposiciones', requireRole(Roles.SOCIO), InscripcionController.superposiciones);
router.get('/:id', InscripcionController.getById);
router.post('/', InscripcionController.create);
router.post('/:id/solicitar-baja', requireRole(Roles.SOCIO), InscripcionController.solicitarBaja);
// El socio vio la novedad que le dejó el club
router.post('/:id/visto', requireRole(Roles.SOCIO), InscripcionController.marcarVista);
// El club agenda la fecha de una prueba y carga su resultado
router.post('/:id/agendar-prueba', requireRole(Roles.ADMIN), InscripcionController.agendarPrueba);
router.post('/:id/resultado', requireRole(Roles.ADMIN), InscripcionController.cargarResultado);
router.put('/:id', requireRole(Roles.ADMIN), InscripcionController.update);
router.delete('/:id', requireRole(Roles.ADMIN), InscripcionController.remove);

export default router;
