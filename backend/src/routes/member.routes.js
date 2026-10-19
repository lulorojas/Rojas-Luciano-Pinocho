import { Router } from 'express';
import { store } from '../store/memoryStore.js';
import { publicUser } from '../auth/users.js';
import { badRequest, forbidden, notFound } from '../utils/httpError.js';
import { inscripcionRules, isBlank, requireFields, today } from './resources.js';
import { validateBirthDate } from './auth.routes.js';

// Los admins no usan estos routers: pasan al CRUD completo que se monta justo después.
const adminPassesThrough = (req, res, next) => (req.user.rol === 'admin' ? next('router') : next());
const denyEverythingElse = () => {
    throw forbidden();
};

/** /socios/me: el socio ve y edita únicamente su propio perfil, y solo los campos permitidos. */
export function createProfileRouter() {
    const router = Router();

    router.get('/', (req, res) => {
        res.json(publicUser(req.user));
    });

    router.put('/', (req, res) => {
        const data = req.body ?? {};
        requireFields(data, { nombre: 'El nombre', apellido: 'El apellido' });
        validateBirthDate(data.fechaNacimiento);
        // Lista blanca: email, rol, estado y demás campos enviados se ignoran
        Object.assign(req.user, {
            nombre: String(data.nombre).trim(),
            apellido: String(data.apellido).trim(),
            telefono: isBlank(data.telefono) ? '' : String(data.telefono).trim(),
            fechaNacimiento: data.fechaNacimiento ?? '',
        });
        res.json(publicUser(req.user));
    });

    // Pedido de baja del club: el admin lo ve y lo procesa; no se borra nada
    router.post('/baja', (req, res) => {
        if (req.user.fechaBajaSolicitada) throw badRequest('Ya pediste la baja del club');
        req.user.fechaBajaSolicitada = today();
        res.json(publicUser(req.user));
    });

    return router;
}

/** /inscripciones para socios: solo las propias, siempre como 'pendiente', y sin editar ni borrar. */
export function createMemberInscripcionesRouter() {
    const router = Router();
    router.use(adminPassesThrough);

    router.get('/', (req, res) => {
        res.json(store.inscripciones.items.filter((ins) => ins.idSocio === req.user.id));
    });

    router.post('/', (req, res) => {
        if (req.user.fechaBajaSolicitada) throw badRequest('Tenés una baja del club en trámite');
        // idSocio y estado los define el servidor: lo que mande el cliente se descarta
        const data = { idSocio: req.user.id, idDisciplina: req.body?.idDisciplina, estado: 'pendiente' };
        inscripcionRules.validate(data, null);
        const inscripcion = inscripcionRules.build(data, store.inscripciones.nextId++);
        store.inscripciones.items.push(inscripcion);
        res.status(201).json(inscripcion);
    });

    router.post('/:id/solicitar-baja', (req, res) => {
        const inscripcion = store.inscripciones.items.find(
            (ins) => ins.id === Number(req.params.id) && ins.idSocio === req.user.id,
        );
        // 404 también si existe pero es ajena: no se revela qué ids existen
        if (!inscripcion) throw notFound('Inscripción no encontrada');
        if (inscripcion.estado === 'baja') throw badRequest('Esta inscripción ya está dada de baja');
        inscripcion.estado = 'baja';
        inscripcion.fechaBajaSolicitada = today();
        inscripcion.fechaFinEfectiva = today();
        res.json(inscripcion);
    });

    router.use(denyEverythingElse);
    return router;
}

/** /cuotas para socios: solo lectura de las propias. */
export function createMemberCuotasRouter() {
    const router = Router();
    router.use(adminPassesThrough);

    router.get('/', (req, res) => {
        res.json(store.cuotas.items.filter((cuota) => cuota.idSocio === req.user.id));
    });

    router.get('/:id', (req, res) => {
        const cuota = store.cuotas.items.find((item) => item.id === Number(req.params.id) && item.idSocio === req.user.id);
        if (!cuota) throw notFound('Cuota no encontrada');
        res.json(cuota);
    });

    router.use(denyEverythingElse);
    return router;
}

/** Pagos online: la interfaz existe pero el servicio todavía no está disponible. */
export function createPagosRouter() {
    const router = Router();
    router.post('/intentos', (req, res) => {
        res.status(501).json({ message: 'Los pagos online estarán disponibles pronto. Por ahora el club registra tu pago.' });
    });
    return router;
}
