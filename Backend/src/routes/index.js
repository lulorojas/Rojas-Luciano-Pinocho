// Punto único donde se agrupan todas las rutas de la API bajo /api.
// Cuando se agreguen más entidades (Socio, Cuota, etc.) sus routers se
// registran acá.

import { Router } from 'express';
import disciplinaRoutes from './disciplinaRoutes.js';

const router = Router();

router.use('/disciplinas', disciplinaRoutes);

export default router;
