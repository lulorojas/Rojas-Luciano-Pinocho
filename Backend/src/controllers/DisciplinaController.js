// Controller: lee lo que llega en el request, se lo pasa al service y
// devuelve la respuesta con el formato estándar. No valida reglas de
// negocio ni toca el array de datos: si el service lanza un error, se lo
// delega al errorHandler con next(error).

import DisciplinaService from '../services/DisciplinaService.js';
import { successResponse } from '../responses/apiResponse.js';

function getAll(req, res, next) {
    try {
        const disciplinas = DisciplinaService.getAll();
        return successResponse(res, disciplinas);
    } catch (error) {
        next(error);
    }
}

function getById(req, res, next) {
    try {
        const id = Number(req.params.id);
        const disciplina = DisciplinaService.getById(id);
        return successResponse(res, disciplina);
    } catch (error) {
        next(error);
    }
}

function create(req, res, next) {
    try {
        const nuevaDisciplina = DisciplinaService.create(req.body);
        return successResponse(res, nuevaDisciplina, 201);
    } catch (error) {
        next(error);
    }
}

function update(req, res, next) {
    try {
        const id = Number(req.params.id);
        const disciplinaActualizada = DisciplinaService.update(id, req.body);
        return successResponse(res, disciplinaActualizada);
    } catch (error) {
        next(error);
    }
}

function remove(req, res, next) {
    try {
        const id = Number(req.params.id);
        DisciplinaService.remove(id);
        return successResponse(res, null);
    } catch (error) {
        next(error);
    }
}

export default {
    getAll,
    getById,
    create,
    update,
    remove
};
