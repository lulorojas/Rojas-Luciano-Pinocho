// Controller de Cuota. El socio solo lee las suyas; el service filtra según req.user.
// Los errores los resuelve el errorHandler.

import CuotaService from '../services/CuotaService.js';
import { successResponse } from '../responses/apiResponse.js';

function getAll(req, res) {
    return successResponse(res, CuotaService.getAll(req.user));
}

function getById(req, res) {
    return successResponse(res, CuotaService.getById(Number(req.params.id), req.user));
}

function create(req, res) {
    return successResponse(res, CuotaService.create(req.body), 201);
}

function update(req, res) {
    return successResponse(res, CuotaService.update(Number(req.params.id), req.body));
}

function remove(req, res) {
    CuotaService.remove(Number(req.params.id));
    return successResponse(res, null);
}

function pagar(req, res) {
    return successResponse(res, CuotaService.pagar(req.user, Number(req.params.id), req.body));
}

export default {
    getAll,
    getById,
    create,
    update,
    remove,
    pagar
};
