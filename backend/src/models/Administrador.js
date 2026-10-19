import Usuario from './Usuario.js';

class Administrador extends Usuario {
    constructor(id, nombre, apellido, email, password, telefono, rol, fechaRegistro, cargo) {
        super(id, nombre, apellido, email, password, telefono, rol, fechaRegistro);
        this.cargo = cargo;
    }
}

export default Administrador;
