// Rutas de autenticación: login y registro son públicos; /me requiere sesión.

import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/me', requireAuth, AuthController.me);

export default router;
