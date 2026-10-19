import { createCrudService } from './api.js';

const service = createCrudService('horarios');

export const getHorarios = service.getAll;
export const getHorario = service.getById;
export const createHorario = service.create;
export const updateHorario = service.update;
export const deleteHorario = service.remove;
