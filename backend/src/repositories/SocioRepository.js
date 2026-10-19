// Repository de Socio: único que toca el array en memoria. Los socios se guardan como objetos
// planos con su passwordHash; la capa de service es la que decide qué se expone hacia afuera.

import { hashPassword } from '../security/passwords.js';
import { DEMO_PASSWORD } from '../security/demoPassword.js';
import { Roles } from '../enums/Roles.js';
import { EstadoSocio } from '../enums/EstadoSocio.js';

let nextId = 1;

const socios = [];

function crearSocioInicial(nombre, apellido, email, telefono, fechaNacimiento, fechaAlta) {
    const id = nextId++;
    socios.push({
        id,
        nombre,
        apellido,
        email,
        telefono,
        rol: Roles.SOCIO,
        passwordHash: hashPassword(DEMO_PASSWORD),
        numeroSocio: 1000 + id,
        fechaNacimiento,
        fechaAlta,
        fechaBajaSolicitada: null,
        estado: EstadoSocio.ACTIVO
    });
}

crearSocioInicial("Lucía", "Martínez", "lucia@mail.com", "3415551001", "1995-03-12", "2025-02-01");
crearSocioInicial("Tomás", "Ruiz", "tomas@mail.com", "3415551002", "1988-11-30", "2025-03-15");
crearSocioInicial("Sofía", "López", "sofia@mail.com", "3415551003", "2001-07-04", "2025-05-20");

function findAll() {
    return socios;
}

function findById(id) {
    return socios.find((socio) => socio.id === id);
}

function findByEmail(email) {
    return socios.find((socio) => socio.email.toLowerCase() === String(email).trim().toLowerCase());
}

function create(datos) {
    const id = nextId++;
    const nuevoSocio = { id, numeroSocio: 1000 + id, ...datos };
    socios.push(nuevoSocio);
    return nuevoSocio;
}

function update(id, cambios) {
    const socio = findById(id);
    if (!socio) {
        return null;
    }
    Object.assign(socio, cambios);
    return socio;
}

function remove(id) {
    const index = socios.findIndex((socio) => socio.id === id);
    if (index === -1) {
        return false;
    }
    socios.splice(index, 1);
    return true;
}

export default {
    findAll,
    findById,
    findByEmail,
    create,
    update,
    remove
};
