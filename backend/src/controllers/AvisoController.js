// Controller de Aviso: el socio lee sus avisos y los marca como leídos.

import AvisoService from '../services/AvisoService.js';
import { successResponse } from '../responses/apiResponse.js';

function getAll(req, res) {
    return successResponse(res, AvisoService.listar(req.user));
}

function marcarLeidos(req, res) {
    return successResponse(res, AvisoService.marcarLeidos(req.user));
}

export default { getAll, marcarLeidos };
