// Service de Pago: los pagos online todavía no están disponibles. La interfaz ya muestra el flujo,
// y este service responde de forma clara en lugar de fingir un cobro.

import NotImplementedError from '../exceptions/NotImplementedError.js';
import { Messages } from '../enums/Messages.js';

function crearIntento() {
    throw new NotImplementedError(Messages.PAGOS_NO_DISPONIBLES);
}

export default {
    crearIntento
};
