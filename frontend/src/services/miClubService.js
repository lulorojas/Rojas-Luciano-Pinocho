import { request } from './api.js';

const send = (path, method, data) => request(path, { method, body: data === undefined ? undefined : JSON.stringify(data) });

// Perfil propio
export const updateProfile = (data) => send('/socios/me', 'PUT', data);
export const requestClubWithdrawal = () => send('/socios/me/baja', 'POST');

// Inscripciones propias (el servidor filtra por el socio autenticado)
export const getMisInscripciones = () => request('/inscripciones');
export const requestEnrollment = (idDisciplina) => send('/inscripciones', 'POST', { idDisciplina });
export const requestEnrollmentWithdrawal = (id) => send(`/inscripciones/${id}/solicitar-baja`, 'POST');

// Cuotas propias (solo lectura)
export const getMisCuotas = () => request('/cuotas');
