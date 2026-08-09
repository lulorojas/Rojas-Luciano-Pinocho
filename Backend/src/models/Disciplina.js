class Disciplina {
    constructor(id, nombre, descripcion, cupoMaximo, cuotaMensual, fechaDesactivacion, activa) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.cupoMaximo = cupoMaximo;
        this.cuotaMensual = cuotaMensual;
        this.fechaDesactivacion = fechaDesactivacion;
        this.activa = activa;
    }
}

export default Disciplina;
