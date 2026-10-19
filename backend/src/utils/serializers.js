// Cómo se ve cada entidad hacia afuera. Todo lo que sale por la API pasa por acá cuando
// contiene datos que no deben exponerse (hash de contraseña, teléfono interno).

export function sinPassword(usuario) {
    const { passwordHash, ...publico } = usuario;
    return publico;
}

// El teléfono del profesor es un dato interno: solo lo ve el administrador.
export function profesorPara(profesor, usuario) {
    if (usuario?.rol === 'admin') {
        return profesor;
    }
    const { telefono, ...publico } = profesor;
    return publico;
}
