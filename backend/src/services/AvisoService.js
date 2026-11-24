// Service de Aviso: mensajes del club para el socio (bienvenida, pedidos, respuestas, etc.).
// Los avisos los generan otros services al pasar algo; el socio solo los lee y los marca como leídos.

import AvisoRepository from '../repositories/AvisoRepository.js';

// Los más nuevos primero
function listar(usuario) {
    return [...AvisoRepository.findBySocio(usuario.id)].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

function marcarLeidos(usuario) {
    AvisoRepository.marcarLeidos(usuario.id);
    return listar(usuario);
}

function crear(idSocio, titulo, cuerpo) {
    return AvisoRepository.create({ idSocio, titulo, cuerpo });
}

export default {
    listar,
    marcarLeidos,
    crear
};
