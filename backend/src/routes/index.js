// Punto único donde se agrupan todas las rutas de la API bajo /api.
// Las rutas de /auth y /public son abiertas; todo lo que se registra después de requireAuth exige
// una sesión válida, y cada router restringe además qué rol puede usar cada endpoint.

import { Router } from 'express';
import authRoutes from './authRoutes.js';
import publicRoutes from './publicRoutes.js';
import disciplinaRoutes from './disciplinaRoutes.js';
import profesorRoutes from './profesorRoutes.js';
import horarioRoutes from './horarioRoutes.js';
import socioRoutes from './socioRoutes.js';
import inscripcionRoutes from './inscripcionRoutes.js';
import cuotaRoutes from './cuotaRoutes.js';
import pagoRoutes from './pagoRoutes.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);

router.use(requireAuth);

router.use('/disciplinas', disciplinaRoutes);
router.use('/profesores', profesorRoutes);
router.use('/horarios', horarioRoutes);
router.use('/socios', socioRoutes);
router.use('/inscripciones', inscripcionRoutes);
router.use('/cuotas', cuotaRoutes);
router.use('/pagos', pagoRoutes);

export default router;
