// Controller de Profesor. Los errores los lanzan los services y los resuelve el errorHandler
// (Express 5 reenvía las excepciones de los handlers, por eso no hace falta try/catch).

import ProfesorService from '../services/ProfesorService.js';
import { successResponse } from '../responses/apiResponse.js';

function getAll(req, res) {
    return successResponse(res, ProfesorService.getAll(req.user));
}

function getById(req, res) {
    return successResponse(res, ProfesorService.getById(Number(req.params.id), req.user));
}

function create(req, res) {
    return successResponse(res, ProfesorService.create(req.body), 201);
}

function update(req, res) {
    return successResponse(res, ProfesorService.update(Number(req.params.id), req.body));
}

function remove(req, res) {
    ProfesorService.remove(Number(req.params.id));
    return successResponse(res, null);
}

export default {
    getAll,
    getById,
    create,
    update,
    remove
};
