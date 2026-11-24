// Repository de Aviso: los mensajes del club para cada socio. Único que toca el array en memoria.

import Aviso from '../models/Aviso.js';

let nextId = 1;

const avisos = [];

function ahoraMenos(minutos) {
    return new Date(Date.now() - minutos * 60_000).toISOString();
}

function crearAvisoInicial(idSocio, titulo, cuerpo, minutosAtras, leido) {
    avisos.push(new Aviso(nextId++, idSocio, titulo, cuerpo, ahoraMenos(minutosAtras), leido));
}

crearAvisoInicial(1, "Tu prueba de Futsal ya tiene fecha", "Mirá el día y la hora en tu panel. La fecha es provisoria.", 30, false);
crearAvisoInicial(1, "Tus cuotas de este mes están por vencer", "Cuota social y Natación. Las podés pagar desde Mis cuotas.", 60 * 20, false);
crearAvisoInicial(1, "Pediste tu lugar en Patín Artístico", "El club lo revisa y te confirma el lugar.", 60 * 24 * 3, true);

function findBySocio(idSocio) {
    return avisos.filter((aviso) => aviso.idSocio === idSocio);
}

function create({ idSocio, titulo, cuerpo }) {
    const nuevo = new Aviso(nextId++, idSocio, titulo, cuerpo, new Date().toISOString(), false);
    avisos.push(nuevo);
    return nuevo;
}

function marcarLeidos(idSocio) {
    for (const aviso of findBySocio(idSocio)) {
        aviso.leido = true;
    }
}

export default {
    findBySocio,
    create,
    marcarLeidos
};
