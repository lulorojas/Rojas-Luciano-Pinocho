import Usuario from './Usuario.js';

class Socio extends Usuario {
    constructor(id, nombre, apellido, email, password, telefono, rol, fechaRegistro, numeroSocio, fechaNacimiento, fechaAlta, fechaBajaSolicitada, estado) {
        super(id, nombre, apellido, email, password, telefono, rol, fechaRegistro);
        this.numeroSocio = numeroSocio;
        this.fechaNacimiento = fechaNacimiento;
        this.fechaAlta = fechaAlta;
        this.fechaBajaSolicitada = fechaBajaSolicitada;
        this.estado = estado;
    }
}

export default Socio;
