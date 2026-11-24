class Aviso {
    // fecha: instante ISO completo · leido: el socio ya abrió su panel de avisos
    constructor(id, idSocio, titulo, cuerpo, fecha, leido = false) {
        this.id = id;
        this.idSocio = idSocio;
        this.titulo = titulo;
        this.cuerpo = cuerpo;
        this.fecha = fecha;
        this.leido = leido;
    }
}

export default Aviso;
