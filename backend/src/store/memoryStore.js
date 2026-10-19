import Disciplina from '../models/Disciplina.js';
import Profesor from '../models/Profesor.js';
import Horario from '../models/Horario.js';
import Inscripcion from '../models/Inscripcion.js';
import Cuota from '../models/Cuota.js';
import { hashPassword } from '../auth/passwords.js';
import { DEMO_PASSWORD } from './seedAccounts.js';

// Colecciones en memoria. Cada una lleva su propio contador de ids.
function createCollection(items) {
    return {
        items,
        nextId: items.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    };
}

const hoy = new Date().toISOString().slice(0, 10);

// Todas las cuentas de la semilla comparten la contraseña de demostración (ver backend/README.md)
const demoHash = hashPassword(DEMO_PASSWORD);

export const store = {
    disciplinas: createCollection([
        new Disciplina(1, 'Natación', 'Clases de natación para todas las edades', 20, 18000, null, true),
        new Disciplina(2, 'Fútbol 5', 'Entrenamiento y partidos recreativos', 14, 12000, null, true),
        new Disciplina(3, 'Yoga', 'Yoga y respiración consciente', 15, 10000, null, true),
        new Disciplina(4, 'Básquet', 'Escuela de básquet juvenil', 16, 11000, null, true),
    ]),
    profesores: createCollection([
        new Profesor(1, 'Marcela', 'Gómez', '3415550101', 'Natación'),
        new Profesor(2, 'Diego', 'Fernández', '3415550102', 'Fútbol'),
        new Profesor(3, 'Laura', 'Pereyra', '3415550103', 'Yoga'),
    ]),
    horarios: createCollection([
        new Horario(1, 1, 1, 'Lunes', '18:00', '19:00'),
        new Horario(2, 1, 1, 'Miércoles', '18:00', '19:00'),
        new Horario(3, 2, 2, 'Martes', '20:00', '21:30'),
        new Horario(4, 3, 3, 'Jueves', '09:00', '10:00'),
    ]),
    // Los administradores solo existen en la semilla: el registro público únicamente crea socios.
    administradores: createCollection([
        {
            id: 1, nombre: 'Ana', apellido: 'Directora', email: 'admin@pinocho.test', telefono: '3415550001',
            rol: 'admin', cargo: 'Administración', passwordHash: demoHash,
        },
    ]),
    // Los socios se guardan como objetos planos con passwordHash; la API nunca lo expone.
    socios: createCollection([
        {
            id: 1, nombre: 'Lucía', apellido: 'Martínez', email: 'lucia@mail.com', rol: 'socio', passwordHash: demoHash, telefono: '3415551001',
            numeroSocio: 1001, fechaNacimiento: '1995-03-12', fechaAlta: '2025-02-01', estado: 'activo',
        },
        {
            id: 2, nombre: 'Tomás', apellido: 'Ruiz', email: 'tomas@mail.com', rol: 'socio', passwordHash: demoHash, telefono: '3415551002',
            numeroSocio: 1002, fechaNacimiento: '1988-11-30', fechaAlta: '2025-03-15', estado: 'activo',
        },
        {
            id: 3, nombre: 'Sofía', apellido: 'López', email: 'sofia@mail.com', rol: 'socio', passwordHash: demoHash, telefono: '3415551003',
            numeroSocio: 1003, fechaNacimiento: '2001-07-04', fechaAlta: '2025-05-20', estado: 'activo',
        },
    ]),
    inscripciones: createCollection([
        new Inscripcion(1, 1, 1, '2025-02-01', '2025-02-02', null, null, 'confirmada'),
        new Inscripcion(2, 2, 2, '2025-03-15', '2025-03-16', null, null, 'confirmada'),
        new Inscripcion(3, 3, 3, hoy, null, null, null, 'pendiente'),
    ]),
    cuotas: createCollection([
        new Cuota(1, 1, '2025-10', 18000, '2025-10-10', '2025-10-05', 'pagada'),
        new Cuota(2, 2, '2025-10', 12000, '2025-10-10', null, 'vencida'),
        new Cuota(3, 3, '2025-11', 10000, '2025-11-10', null, 'pendiente'),
    ]),
};
