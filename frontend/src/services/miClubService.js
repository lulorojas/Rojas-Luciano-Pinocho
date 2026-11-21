import { request } from './api.js';

const send = (path, method, data) => request(path, { method, body: data === undefined ? undefined : JSON.stringify(data) });

// Perfil propio
export const updateProfile = (data) => send('/socios/me', 'PUT', data);
export const requestClubWithdrawal = () => send('/socios/me/baja', 'POST');

// Inscripciones propias (el servidor filtra por el socio autenticado)
export const getMisInscripciones = () => request('/inscripciones');
// Disciplinas del socio con las que se pisa la elegida (solo es un aviso, no impide inscribirse)
export const getSuperposiciones = (idDisciplina) => request(`/inscripciones/superposiciones?idDisciplina=${idDisciplina}`);
export const requestEnrollment = (idDisciplina) => send('/inscripciones', 'POST', { idDisciplina });
export const requestEnrollmentWithdrawal = (id) => send(`/inscripciones/${id}/solicitar-baja`, 'POST');

// Cuotas propias: se leen y el socio las paga (el servidor fija el importe, la fecha y el estado)
export const getMisCuotas = () => request('/cuotas');
export const payCuota = (id, medioPago) => send(`/cuotas/${id}/pagar`, 'POST', { medioPago });
