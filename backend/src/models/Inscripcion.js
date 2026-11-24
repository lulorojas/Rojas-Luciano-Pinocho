class Inscripcion {
    // fechaPrueba: "AAAA-MM-DDTHH:MM" (hora local del club) cuando hay una prueba agendada
    // nuevo: el club cambió algo que el socio todavía no vio (alimenta "Para resolver")
    constructor(
        id,
        idSocio,
        idDisciplina,
        fechaSolicitud,
        fechaConfirmacion,
        fechaBajaSolicitada,
        fechaFinEfectiva,
        estado,
        fechaPrueba = null,
        nuevo = false
    ) {
        this.id = id;
        this.idSocio = idSocio;
        this.idDisciplina = idDisciplina;
        this.fechaSolicitud = fechaSolicitud;
        this.fechaConfirmacion = fechaConfirmacion;
        this.fechaBajaSolicitada = fechaBajaSolicitada;
        this.fechaFinEfectiva = fechaFinEfectiva;
        this.estado = estado;
        this.fechaPrueba = fechaPrueba;
        this.nuevo = nuevo;
    }
}

export default Inscripcion;
