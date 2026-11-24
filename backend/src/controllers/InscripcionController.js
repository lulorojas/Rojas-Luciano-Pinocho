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

// Administrador: alta completa. Socio: solicitud propia (el estado inicial lo fija el servidor según el tipo
// de disciplina: SOLICITADA o PRUEBA_SOLICITADA).
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

function agendarPrueba(req, res) {
    return successResponse(res, InscripcionService.agendarPrueba(Number(req.params.id), req.body));
}

function cargarResultado(req, res) {
    return successResponse(res, InscripcionService.cargarResultado(Number(req.params.id), req.body));
}

function marcarVista(req, res) {
    return successResponse(res, InscripcionService.marcarVista(req.user, Number(req.params.id)));
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
    agendarPrueba,
    cargarResultado,
    marcarVista,
    solicitarBaja,
    superposiciones
};
