import { createCrudService } from './api.js';

const service = createCrudService('socios');

export const getSocios = service.getAll;
export const getSocio = service.getById;
export const createSocio = service.create;
export const updateSocio = service.update;
export const deleteSocio = service.remove;
