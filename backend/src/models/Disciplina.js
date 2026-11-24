class Disciplina {
    // tipoInscripcion: "directa" | "prueba" · cuotaAparte: monto mensual propio o null si está incluida en la cuota social
    constructor(id, nombre, descripcion, categorias, cupoMaximo, tipoInscripcion, cuotaAparte, fechaDesactivacion, activa) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categorias = categorias;
        this.cupoMaximo = cupoMaximo;
        this.tipoInscripcion = tipoInscripcion;
        this.cuotaAparte = cuotaAparte;
        this.fechaDesactivacion = fechaDesactivacion;
        this.activa = activa;
    }
}

export default Disciplina;
