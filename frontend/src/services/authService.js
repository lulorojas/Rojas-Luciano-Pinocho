import { request } from './api.js';

const post = (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) });

export const login = (credentials) => post('/auth/login', credentials);
export const register = (data) => post('/auth/register', data);
export const getCurrentUser = () => request('/auth/me');
