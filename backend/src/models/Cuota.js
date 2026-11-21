class Cuota {
    constructor(id, idSocio, periodo, monto, fechaVencimiento, fechaPago, estado, medioPago = null) {
        this.id = id;
        this.idSocio = idSocio;
        this.periodo = periodo;
        this.monto = monto;
        this.fechaVencimiento = fechaVencimiento;
        this.fechaPago = fechaPago;
        this.estado = estado;
        this.medioPago = medioPago;
    }
}

export default Cuota;
