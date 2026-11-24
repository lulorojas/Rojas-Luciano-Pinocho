import { request } from './api.js';

// Disciplinas activas (con tipo, cuota aparte y horarios) para quien todavía no inició sesión
export const getPublicDisciplinas = () => request('/public/disciplinas');
// Valores provisorios del club: cuota social y edad desde la que no hace falta un adulto responsable
export const getClubInfo = () => request('/public/club');
