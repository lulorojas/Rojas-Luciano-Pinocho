// Controller de Inscripcion. El socio y el administrador comparten algunas rutas: el service decide
// qué ve cada uno según el usuario (req.user). Los errores los resuelve el errorHandler.

import InscripcionService from '../services/InscripcionService.js';
import { successResponse } from '../responses/apiResponse.js';
import { Roles } from '../enums/Roles.js';

function getAll(req, res) {
    return successResponse(res, InscripcionService.getAll(req.user));
}

function getById(req, res) {
    return successResponse(res, InscripcionService.getById(Number(req.params.id), req.user));
}

// Administrador: alta completa. Socio: solicitud propia (siempre PENDIENTE, lo demás lo fija el servidor).
function create(req, res) {
    const inscripcion =
        req.user.rol === Roles.ADMIN
            ? InscripcionService.create(req.body)
            : InscripcionService.solicitar(req.user, req.body?.idDisciplina);
    return successResponse(res, inscripcion, 201);
}

function superposiciones(req, res) {
    const idDisciplina = req.query.idDisciplina === undefined ? undefined : Number(req.query.idDisciplina);
    return successResponse(res, InscripcionService.superposiciones(req.user, idDisciplina));
}

function update(req, res) {
    return successResponse(res, InscripcionService.update(Number(req.params.id), req.body));
}

function remove(req, res) {
    InscripcionService.remove(Number(req.params.id));
    return successResponse(res, null);
}

function solicitarBaja(req, res) {
    return successResponse(res, InscripcionService.solicitarBaja(req.user, Number(req.params.id)));
}

export default {
    getAll,
    getById,
    create,
    update,
    remove,
    solicitarBaja,
    superposiciones
};
