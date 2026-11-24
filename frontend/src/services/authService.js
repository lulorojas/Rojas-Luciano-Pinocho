import { request } from './api.js';

const post = (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) });

// `identificador` es el email o el DNI; el servidor acepta ambos en el campo `email`
export const login = ({ identificador, password }) => post('/auth/login', { email: identificador, password });
export const register = (data) => post('/auth/register', data);
export const getCurrentUser = () => request('/auth/me');
