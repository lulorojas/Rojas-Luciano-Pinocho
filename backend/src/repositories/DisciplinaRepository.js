// Repository: única capa autorizada a tocar el array en memoria que hace
// de "base de datos" de Disciplina. No valida reglas de negocio (eso es
// responsabilidad del service): solo sabe leer, agregar, actualizar y
// borrar elementos del array, y generar ids.

import Disciplina from '../models/Disciplina.js';
import { TipoInscripcion } from '../enums/TipoInscripcion.js';

let nextId = 1;

const disciplinas = [];

// Tipos de inscripción, cuotas y categorías son PROVISORIOS hasta que el club los confirme.
function crearDisciplinaInicial(nombre, descripcion, categorias, cupoMaximo, tipoInscripcion, cuotaAparte) {
    disciplinas.push(
        new Disciplina(nextId++, nombre, descripcion, categorias, cupoMaximo, tipoInscripcion, cuotaAparte, null, true)
    );
}

const { DIRECTA, PRUEBA } = TipoInscripcion;

crearDisciplinaInicial(
    "Futsal",
    "La disciplina estrella del club, con plantel masculino y femenino.",
    "Masculino y femenino",
    20,
    PRUEBA,
    null
);
crearDisciplinaInicial(
    "Natación",
    "Clases de natación en pileta climatizada, por niveles.",
    "Por niveles",
    15,
    DIRECTA,
    9500
);
crearDisciplinaInicial(
    "Patín Artístico",
    "Patín artístico sobre ruedas, desde iniciación hasta nivel competitivo.",
    "Iniciación a competitivo",
    18,
    DIRECTA,
    7500
);
crearDisciplinaInicial(
    "Gimnasia Artística",
    "Gimnasia artística femenina y masculina, por categorías.",
    "Femenina y masculina",
    16,
    DIRECTA,
    8500
);
crearDisciplinaInicial("Básquet", "Entrenamientos de básquet en el club.", "A confirmar", 20, PRUEBA, null);
crearDisciplinaInicial("Vóley", "Entrenamientos de vóley en el club.", "A confirmar", 20, PRUEBA, null);
crearDisciplinaInicial("Karate", "Clases de karate en el club.", "A confirmar", 20, DIRECTA, null);

function findAll() {
    return disciplinas;
}

function findById(id) {
    return disciplinas.find((disciplina) => disciplina.id === id);
}

function create({ nombre, descripcion, categorias, cupoMaximo, tipoInscripcion, cuotaAparte, fechaDesactivacion, activa }) {
    const nuevaDisciplina = new Disciplina(
        nextId++,
        nombre,
        descripcion ?? '',
        categorias ?? '',
        cupoMaximo,
        tipoInscripcion,
        cuotaAparte ?? null,
        fechaDesactivacion ?? null,
        activa ?? true
    );
    disciplinas.push(nuevaDisciplina);
    return nuevaDisciplina;
}

function update(id, { nombre, descripcion, categorias, cupoMaximo, tipoInscripcion, cuotaAparte, fechaDesactivacion, activa }) {
    const disciplina = findById(id);
    if (!disciplina) {
        return null;
    }
    disciplina.nombre = nombre;
    disciplina.descripcion = descripcion ?? '';
    disciplina.categorias = categorias ?? '';
    disciplina.cupoMaximo = cupoMaximo;
    disciplina.tipoInscripcion = tipoInscripcion;
    disciplina.cuotaAparte = cuotaAparte ?? null;
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
