// Controller de Horario. Los errores los lanzan los services y los resuelve el errorHandler
// (Express 5 reenvía las excepciones de los handlers, por eso no hace falta try/catch).

import HorarioService from '../services/HorarioService.js';
import { successResponse } from '../responses/apiResponse.js';

function getAll(req, res) {
    return successResponse(res, HorarioService.getAll());
}

function getById(req, res) {
    return successResponse(res, HorarioService.getById(Number(req.params.id)));
}

function create(req, res) {
    return successResponse(res, HorarioService.create(req.body), 201);
}

function update(req, res) {
    return successResponse(res, HorarioService.update(Number(req.params.id), req.body));
}

function remove(req, res) {
    HorarioService.remove(Number(req.params.id));
    return successResponse(res, null);
}

export default {
    getAll,
    getById,
    create,
    update,
    remove
};
