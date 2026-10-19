// Repository de Profesor: único que toca el array en memoria.

import Profesor from '../models/Profesor.js';

let nextId = 1;

const profesores = [];

function crearProfesorInicial(nombre, apellido, telefono, especialidad) {
    profesores.push(new Profesor(nextId++, nombre, apellido, telefono, especialidad));
}

crearProfesorInicial("Marcela", "Gómez", "3415550101", "Natación");
crearProfesorInicial("Diego", "Fernández", "3415550102", "Futsal");
crearProfesorInicial("Laura", "Pereyra", "3415550103", "Patín y gimnasia artística");

function findAll() {
    return profesores;
}

function findById(id) {
    return profesores.find((profesor) => profesor.id === id);
}

function create({ nombre, apellido, telefono, especialidad }) {
    const nuevoProfesor = new Profesor(nextId++, nombre, apellido, telefono, especialidad);
    profesores.push(nuevoProfesor);
    return nuevoProfesor;
}

function update(id, { nombre, apellido, telefono, especialidad }) {
    const profesor = findById(id);
    if (!profesor) {
        return null;
    }
    profesor.nombre = nombre;
    profesor.apellido = apellido;
    profesor.telefono = telefono;
    profesor.especialidad = especialidad;
    return profesor;
}

function remove(id) {
    const index = profesores.findIndex((profesor) => profesor.id === id);
    if (index === -1) {
        return false;
    }
    profesores.splice(index, 1);
    return true;
}

export default {
    findAll,
    findById,
    create,
    update,
    remove
};
