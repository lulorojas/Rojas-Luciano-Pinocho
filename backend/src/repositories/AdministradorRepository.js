// Repository de Administrador. Los administradores solo existen en esta semilla: el registro
// público únicamente crea socios, así que nadie puede darse de alta como admin desde la API.

import { hashPassword } from '../security/passwords.js';
import { DEMO_PASSWORD } from '../security/demoPassword.js';
import { Roles } from '../enums/Roles.js';

const administradores = [
    {
        id: 1,
        nombre: "Ana",
        apellido: "Directora",
        email: "admin@pinocho.test",
        telefono: "3415550001",
        rol: Roles.ADMIN,
        cargo: "Administración",
        passwordHash: hashPassword(DEMO_PASSWORD)
    }
];

function findById(id) {
    return administradores.find((administrador) => administrador.id === id);
}

function findByEmail(email) {
    return administradores.find(
        (administrador) => administrador.email.toLowerCase() === String(email).trim().toLowerCase()
    );
}

export default {
    findById,
    findByEmail
};
