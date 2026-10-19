class Inscripcion {
    constructor(id, idSocio, idDisciplina, fechaSolicitud, fechaConfirmacion, fechaBajaSolicitada, fechaFinEfectiva, estado) {
        this.id = id;
        this.idSocio = idSocio;
        this.idDisciplina = idDisciplina;
        this.fechaSolicitud = fechaSolicitud;
        this.fechaConfirmacion = fechaConfirmacion;
        this.fechaBajaSolicitada = fechaBajaSolicitada;
        this.fechaFinEfectiva = fechaFinEfectiva;
        this.estado = estado;
    }
}

export default Inscripcion;
