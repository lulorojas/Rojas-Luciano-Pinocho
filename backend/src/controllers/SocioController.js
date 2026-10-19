// Controller de Socio. Incluye dos grupos de acciones: las del administrador (CRUD de socios) y las
// del propio socio sobre su perfil (/socios/me). Qué rol puede usar cada una se define en las rutas.
// Los errores los lanzan los services y los resuelve el errorHandler.

import SocioService from '../services/SocioService.js';
import { successResponse } from '../responses/apiResponse.js';

// ---- Administrador ----

function getAll(req, res) {
    return successResponse(res, SocioService.getAll());
}

function getById(req, res) {
    return successResponse(res, SocioService.getById(Number(req.params.id)));
}

function create(req, res) {
    return successResponse(res, SocioService.create(req.body), 201);
}

function update(req, res) {
    return successResponse(res, SocioService.update(Number(req.params.id), req.body));
}

function remove(req, res) {
    SocioService.remove(Number(req.params.id));
    return successResponse(res, null);
}

// ---- Socio: su propio perfil ----

function getPerfil(req, res) {
    return successResponse(res, SocioService.getPerfil(req.user));
}

function updatePerfil(req, res) {
    return successResponse(res, SocioService.updatePerfil(req.user, req.body));
}

function pedirBajaClub(req, res) {
    return successResponse(res, SocioService.pedirBajaClub(req.user));
}

export default {
    getAll,
    getById,
    create,
    update,
    remove,
    getPerfil,
    updatePerfil,
    pedirBajaClub
};
