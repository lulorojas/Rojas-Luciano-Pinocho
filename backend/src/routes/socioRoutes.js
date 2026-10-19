// Rutas de Socio.
//   /socios/me...  -> solo el propio socio (su perfil y su pedido de baja del club).
//   /socios...     -> solo administrador.
// Las rutas /me van primero para que "me" no se interprete como un :id.

import { Router } from 'express';
import SocioController from '../controllers/SocioController.js';
import { requireRole } from '../middlewares/auth.js';
import { Roles } from '../enums/Roles.js';

const router = Router();

router.get('/me', requireRole(Roles.SOCIO), SocioController.getPerfil);
router.put('/me', requireRole(Roles.SOCIO), SocioController.updatePerfil);
router.post('/me/baja', requireRole(Roles.SOCIO), SocioController.pedirBajaClub);

router.use(requireRole(Roles.ADMIN));

router.get('/', SocioController.getAll);
router.get('/:id', SocioController.getById);
router.post('/', SocioController.create);
router.put('/:id', SocioController.update);
router.delete('/:id', SocioController.remove);

export default router;
