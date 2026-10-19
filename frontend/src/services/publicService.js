import { request } from './api.js';

// Disciplinas activas para quien todavía no inició sesión (página de inicio pública)
export const getPublicDisciplinas = () => request('/public/disciplinas');
