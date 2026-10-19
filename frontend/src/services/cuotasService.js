import { createCrudService } from './api.js';

const service = createCrudService('cuotas');

export const getCuotas = service.getAll;
export const getCuota = service.getById;
export const createCuota = service.create;
export const updateCuota = service.update;
export const deleteCuota = service.remove;
