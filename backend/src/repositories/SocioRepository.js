// Repository de Socio: único que toca el array en memoria. Los socios se guardan como objetos
// planos con su passwordHash; la capa de service es la que decide qué se expone hacia afuera.

import { hashPassword } from '../security/passwords.js';
import { DEMO_PASSWORD } from '../security/demoPassword.js';
import { Roles } from '../enums/Roles.js';
import { EstadoSocio } from '../enums/EstadoSocio.js';

let nextId = 1;

const socios = [];

// `telefono` es el celular del socio. `adultoResponsable` ({ nombre, dni, celular }) solo existe en menores.
function crearSocioInicial(nombre, apellido, dni, email, telefono, fechaNacimiento, fechaAlta) {
    const id = nextId++;
    socios.push({
        id,
        nombre,
        apellido,
        dni,
        email,
        telefono,
        rol: Roles.SOCIO,
        passwordHash: hashPassword(DEMO_PASSWORD),
        numeroSocio: 1000 + id,
        fechaNacimiento,
        fechaAlta,
        adultoResponsable: null,
        fechaBajaSolicitada: null,
        estado: EstadoSocio.ACTIVO
    });
}

crearSocioInicial("Lucía", "Martínez", "40123456", "lucia@mail.com", "11 2345-6789", "1994-05-12", "2025-02-03");
crearSocioInicial("Tomás", "Ruiz", "35111222", "tomas@mail.com", "11 5555-1002", "1988-11-30", "2025-03-15");
crearSocioInicial("Sofía", "López", "43999888", "sofia@mail.com", "11 5555-1003", "2001-07-04", "2025-05-20");

function findAll() {
    return socios;
}

function findById(id) {
    return socios.find((socio) => socio.id === id);
}

function findByDni(dni) {
    return socios.find((socio) => socio.dni && socio.dni === dni);
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
    findByDni,
    create,
    update,
    remove
};
