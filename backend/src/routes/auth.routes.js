import { Router } from 'express';
import { store } from '../store/memoryStore.js';
import { DUMMY_HASH, hashPassword, verifyPassword } from '../auth/passwords.js';
import { createToken } from '../auth/tokens.js';
import { requireAuth } from '../auth/middleware.js';
import { createLoginLimiter } from '../auth/loginLimiter.js';
import { findUserByEmail, publicUser } from '../auth/users.js';
import { badRequest, unauthorized } from '../utils/httpError.js';
import { EMAIL_REGEX, isBlank, requireFields, today } from './resources.js';

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

export function validateBirthDate(value) {
    if (isBlank(value)) return;
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
    if (!valid) throw badRequest('La fecha de nacimiento no es válida');
    if (value > today()) throw badRequest('La fecha de nacimiento no puede ser futura');
}

const session = (user) => ({
    token: createToken({ sub: user.id, rol: user.rol }),
    user: publicUser(user),
});

export function createAuthRouter() {
    const router = Router();
    const limiter = createLoginLimiter();

    router.post('/login', (req, res) => {
        const email = String(req.body?.email ?? '').trim().toLowerCase();
        const password = String(req.body?.password ?? '');
        const key = `${req.ip}|${email}`;
        limiter.check(key);

        const user = findUserByEmail(email);
        // Se verifica siempre una contraseña (aunque el email no exista) y el mensaje es el mismo en ambos casos
        const valid = verifyPassword(password, user?.passwordHash ?? DUMMY_HASH) && Boolean(user);
        if (!valid) {
            limiter.fail(key);
            throw unauthorized('Email o contraseña incorrectos');
        }
        limiter.reset(key);
        res.json(session(user));
    });

    // El registro público SOLO crea socios: el rol nunca se toma del body.
    router.post('/register', (req, res) => {
        const data = req.body ?? {};
        requireFields(data, { nombre: 'El nombre', apellido: 'El apellido', email: 'El email', password: 'La contraseña' });
        if (!EMAIL_REGEX.test(data.email)) throw badRequest('El email no es válido');
        if (String(data.password).length < MIN_PASSWORD) {
            throw badRequest(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres`);
        }
        if (String(data.password).length > MAX_PASSWORD) throw badRequest('La contraseña es demasiado larga');
        if (findUserByEmail(data.email)) throw badRequest('Ya existe una cuenta con ese email');
        validateBirthDate(data.fechaNacimiento);

        const id = store.socios.nextId++;
        const socio = {
            id,
            nombre: String(data.nombre).trim(),
            apellido: String(data.apellido).trim(),
            email: String(data.email).trim(),
            telefono: data.telefono ? String(data.telefono).trim() : '',
            rol: 'socio',
            passwordHash: hashPassword(String(data.password)),
            numeroSocio: 1000 + id,
            fechaNacimiento: data.fechaNacimiento ?? '',
            fechaAlta: today(),
            fechaBajaSolicitada: null,
            estado: 'activo',
        };
        store.socios.items.push(socio);
        res.status(201).json(session(socio));
    });

    router.get('/me', requireAuth, (req, res) => {
        res.json(publicUser(req.user));
    });

    return router;
}
