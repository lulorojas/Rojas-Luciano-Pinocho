import { createCrudService } from './api.js';

const service = createCrudService('profesores');

export const getProfesores = service.getAll;
export const getProfesor = service.getById;
export const createProfesor = service.create;
export const updateProfesor = service.update;
export const deleteProfesor = service.remove;
