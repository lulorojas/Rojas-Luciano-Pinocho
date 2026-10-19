import { Router } from 'express';
import { store } from '../store/memoryStore.js';
import { notFound } from '../utils/httpError.js';

/**
 * Crea un router CRUD sobre una colección en memoria.
 * - validate(data, current): lanza HttpError si los datos no son válidos.
 * - build(data, id): arma el registro nuevo a partir del body.
 * - beforeDelete(item): permite impedir el borrado (lanza HttpError).
 * - serialize(item, req): forma pública del registro (oculta campos sensibles, agrega calculados).
 *
 * El control de acceso (quién puede llamar a qué) se aplica al montar el router en app.js.
 */
export function createCrudRouter({ collection, label, validate, build, beforeDelete, serialize = (item) => item }) {
    const router = Router();
    const col = () => store[collection];

    const findOrFail = (id) => {
        const item = col().items.find((entry) => entry.id === Number(id));
        if (!item) throw notFound(`${label} no encontrado`);
        return item;
    };

    router.get('/', (req, res) => {
        res.json(col().items.map((item) => serialize(item, req)));
    });

    router.get('/:id', (req, res) => {
        res.json(serialize(findOrFail(req.params.id), req));
    });

    router.post('/', (req, res) => {
        validate(req.body, null);
        const item = build(req.body, col().nextId++);
        col().items.push(item);
        res.status(201).json(serialize(item, req));
    });

    router.put('/:id', (req, res) => {
        const current = findOrFail(req.params.id);
        const merged = { ...current, ...req.body };
        validate(merged, current);
        Object.assign(current, build(merged, current.id));
        res.json(serialize(current, req));
    });

    router.delete('/:id', (req, res) => {
        const item = findOrFail(req.params.id);
        if (beforeDelete) beforeDelete(item);
        col().items = col().items.filter((entry) => entry.id !== item.id);
        res.status(204).end();
    });

    return router;
}
