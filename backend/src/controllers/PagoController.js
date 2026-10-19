// Controller de Pago. Hoy solo expone el intento de pago, que responde "todavía no disponible".

import PagoService from '../services/PagoService.js';
import { successResponse } from '../responses/apiResponse.js';

function crearIntento(req, res) {
    return successResponse(res, PagoService.crearIntento(req.body), 201);
}

export default {
    crearIntento
};
