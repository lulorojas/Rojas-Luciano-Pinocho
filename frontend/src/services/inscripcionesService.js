import { createCrudService, request } from './api.js';

const service = createCrudService('inscripciones');

export const getInscripciones = service.getAll;
export const getInscripcion = service.getById;
export const createInscripcion = service.create;
export const updateInscripcion = service.update;
export const deleteInscripcion = service.remove;

// El club agenda la fecha de una prueba ("AAAA-MM-DDTHH:MM") y carga su resultado
const post = (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) });
export const scheduleTrial = (id, fechaPrueba) => post(`/inscripciones/${id}/agendar-prueba`, { fechaPrueba });
export const setTrialResult = (id, resultado) => post(`/inscripciones/${id}/resultado`, { resultado });
