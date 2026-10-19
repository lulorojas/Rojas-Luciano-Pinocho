// Controller de autenticación. Los errores (credenciales inválidas, datos incorrectos, límite de
// intentos) los lanzan los services y los resuelve el errorHandler: Express 5 reenvía solo las
// excepciones de los handlers, por eso acá no hace falta try/catch.

import AuthService from '../services/AuthService.js';
import { successResponse } from '../responses/apiResponse.js';

function login(req, res) {
    const sesion = AuthService.login({
        email: req.body?.email,
        password: req.body?.password,
        ip: req.ip
    });
    return successResponse(res, sesion);
}

function register(req, res) {
    return successResponse(res, AuthService.register(req.body), 201);
}

function me(req, res) {
    return successResponse(res, AuthService.getPerfil(req.user));
}

export default {
    login,
    register,
    me
};
