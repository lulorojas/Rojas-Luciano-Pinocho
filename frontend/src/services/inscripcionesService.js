import { createCrudService } from './api.js';

const service = createCrudService('inscripciones');

export const getInscripciones = service.getAll;
export const getInscripcion = service.getById;
export const createInscripcion = service.create;
export const updateInscripcion = service.update;
export const deleteInscripcion = service.remove;
