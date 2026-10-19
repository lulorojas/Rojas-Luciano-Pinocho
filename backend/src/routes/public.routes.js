import { Router } from 'express';
import { store } from '../store/memoryStore.js';
import { inscriptosDe } from './resources.js';

/**
 * Datos que la página de inicio muestra a quien todavía no tiene cuenta.
 * Es una lista blanca deliberada: solo disciplinas activas y solo campos comerciales.
 */
export function createPublicRouter() {
    const router = Router();

    router.get('/disciplinas', (req, res) => {
        res.json(
            store.disciplinas.items
                .filter((disciplina) => disciplina.activa)
                .map(({ id, nombre, descripcion, cuotaMensual, cupoMaximo }) => ({
                    id,
                    nombre,
                    descripcion,
                    cuotaMensual,
                    cupoDisponible: Math.max(cupoMaximo - inscriptosDe(id), 0),
                })),
        );
    });

    return router;
}
