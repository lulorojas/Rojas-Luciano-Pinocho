import { createCrudService } from './api.js';

const service = createCrudService('disciplinas');

export const getDisciplinas = service.getAll;
export const getDisciplina = service.getById;
export const createDisciplina = service.create;
export const updateDisciplina = service.update;
export const deleteDisciplina = service.remove;
