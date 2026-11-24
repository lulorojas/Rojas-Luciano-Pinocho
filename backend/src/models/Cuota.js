class Cuota {
    // tipo: "social" | "disciplina" · idDisciplina: solo en las cuotas de disciplina
    constructor(id, idSocio, tipo, idDisciplina, periodo, monto, fechaVencimiento, fechaPago, estado, medioPago = null) {
        this.id = id;
        this.idSocio = idSocio;
        this.tipo = tipo;
        this.idDisciplina = idDisciplina;
        this.periodo = periodo;
        this.monto = monto;
        this.fechaVencimiento = fechaVencimiento;
        this.fechaPago = fechaPago;
        this.estado = estado;
        this.medioPago = medioPago;
    }
}

export default Cuota;
