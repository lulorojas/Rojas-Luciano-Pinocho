// Repository de Horario: único que toca el array en memoria.
// Las disciplinas y profesores de la semilla se identifican por el id que les asignan sus repositories
// (Disciplina: 1 Futsal, 2 Natación, 3 Patín Artístico, 4 Gimnasia Artística, 5 Básquet, 6 Vóley, 7 Karate ·
// Profesor: 1 Marcela, 2 Diego, 3 Laura).

import Horario from '../models/Horario.js';

let nextId = 1;

const horarios = [];

function crearHorarioInicial(idDisciplina, idProfesor, diaSemana, horaInicio, horaFin) {
    horarios.push(new Horario(nextId++, idDisciplina, idProfesor, diaSemana, horaInicio, horaFin));
}

crearHorarioInicial(2, 1, "Lunes", "18:00", "19:00");
crearHorarioInicial(2, 1, "Miércoles", "18:00", "19:00");
crearHorarioInicial(1, 2, "Martes", "20:00", "21:30");
crearHorarioInicial(3, 3, "Jueves", "17:30", "19:00");
crearHorarioInicial(4, 3, "Viernes", "17:00", "18:30");
// Disciplinas 5 Básquet, 6 Vóley, 7 Karate (horarios provisorios)
crearHorarioInicial(5, 2, "Lunes", "19:30", "21:00");
crearHorarioInicial(5, 2, "Jueves", "20:00", "21:30");
crearHorarioInicial(6, 2, "Miércoles", "19:30", "21:00");
crearHorarioInicial(7, 1, "Martes", "18:00", "19:00");
crearHorarioInicial(7, 1, "Jueves", "18:00", "19:00");

function findAll() {
    return horarios;
}

function findById(id) {
    return horarios.find((horario) => horario.id === id);
}

function create({ idDisciplina, idProfesor, diaSemana, horaInicio, horaFin }) {
    const nuevoHorario = new Horario(nextId++, idDisciplina, idProfesor, diaSemana, horaInicio, horaFin);
    horarios.push(nuevoHorario);
    return nuevoHorario;
}

function update(id, { idDisciplina, idProfesor, diaSemana, horaInicio, horaFin }) {
    const horario = findById(id);
    if (!horario) {
        return null;
    }
    horario.idDisciplina = idDisciplina;
    horario.idProfesor = idProfesor;
    horario.diaSemana = diaSemana;
    horario.horaInicio = horaInicio;
    horario.horaFin = horaFin;
    return horario;
}

function remove(id) {
    const index = horarios.findIndex((horario) => horario.id === id);
    if (index === -1) {
        return false;
    }
    horarios.splice(index, 1);
    return true;
}

export default {
    findAll,
    findById,
    create,
    update,
    remove
};
