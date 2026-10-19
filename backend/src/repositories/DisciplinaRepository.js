// Repository: única capa autorizada a tocar el array en memoria que hace
// de "base de datos" de Disciplina. No valida reglas de negocio (eso es
// responsabilidad del service): solo sabe leer, agregar, actualizar y
// borrar elementos del array, y generar ids.

import Disciplina from '../models/Disciplina.js';

let nextId = 1;

const disciplinas = [];

function crearDisciplinaInicial(nombre, descripcion, cupoMaximo, cuotaMensual) {
    disciplinas.push(
        new Disciplina(nextId++, nombre, descripcion, cupoMaximo, cuotaMensual, null, true)
    );
}

crearDisciplinaInicial(
    "Futsal",
    "Fútbol de salón para todas las edades, entrenamientos y torneos internos.",
    20,
    8000
);
crearDisciplinaInicial(
    "Natación",
    "Clases de natación en pileta climatizada, por niveles.",
    15,
    9500
);
crearDisciplinaInicial(
    "Patín Artístico",
    "Patín artístico sobre ruedas, desde iniciación hasta nivel competitivo.",
    18,
    7500
);
crearDisciplinaInicial(
    "Gimnasia Artística",
    "Gimnasia artística femenina y masculina, por categorías.",
    16,
    8500
);

function findAll() {
    return disciplinas;
}

function findById(id) {
    return disciplinas.find((disciplina) => disciplina.id === id);
}

function create({ nombre, descripcion, cupoMaximo, cuotaMensual, fechaDesactivacion, activa }) {
    const nuevaDisciplina = new Disciplina(
        nextId++,
        nombre,
        descripcion,
        cupoMaximo,
        cuotaMensual,
        fechaDesactivacion ?? null,
        activa ?? true
    );
    disciplinas.push(nuevaDisciplina);
    return nuevaDisciplina;
}

function update(id, { nombre, descripcion, cupoMaximo, cuotaMensual, fechaDesactivacion, activa }) {
    const disciplina = findById(id);
    if (!disciplina) {
        return null;
    }
    disciplina.nombre = nombre;
    disciplina.descripcion = descripcion;
    disciplina.cupoMaximo = cupoMaximo;
    disciplina.cuotaMensual = cuotaMensual;
    disciplina.fechaDesactivacion = fechaDesactivacion ?? null;
    disciplina.activa = activa ?? true;
    return disciplina;
}

function remove(id) {
    const index = disciplinas.findIndex((disciplina) => disciplina.id === id);
    if (index === -1) {
        return false;
    }
    disciplinas.splice(index, 1);
    return true;
}

export default {
    findAll,
    findById,
    create,
    update,
    remove
};
