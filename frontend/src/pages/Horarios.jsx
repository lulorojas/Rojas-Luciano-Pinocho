import ResourcePage from '../components/ResourcePage.jsx';
import { getHorarios, createHorario, updateHorario, deleteHorario } from '../services/horariosService.js';
import { getDisciplinas } from '../services/disciplinasService.js';
import { getProfesores } from '../services/profesoresService.js';
import { DIAS_SEMANA } from '../utils/constants.js';
import { fullName } from '../utils/formatters.js';

const service = {
    getAll: getHorarios,
    create: createHorario,
    update: updateHorario,
    remove: deleteHorario,
};

const lookups = { disciplinas: getDisciplinas, profesores: getProfesores };

const nombreDisciplina = (item, { disciplinas }) => disciplinas.find((d) => d.id === item.idDisciplina)?.nombre ?? '—';
const nombreProfesor = (item, { profesores }) => fullName(profesores.find((p) => p.id === item.idProfesor));

const columns = (ctx) => [
    { key: 'idDisciplina', header: 'Disciplina', render: (item) => nombreDisciplina(item, ctx) },
    { key: 'idProfesor', header: 'Profesor', render: (item) => nombreProfesor(item, ctx) },
    { key: 'diaSemana', header: 'Día' },
    { key: 'horaInicio', header: 'Desde' },
    { key: 'horaFin', header: 'Hasta' },
];

const fields = ({ disciplinas, profesores }) => [
    {
        name: 'idDisciplina',
        label: 'Disciplina',
        type: 'select',
        placeholder: 'Elegí una disciplina',
        required: true,
        options: disciplinas.map((d) => ({ value: String(d.id), label: d.nombre })),
    },
    {
        name: 'idProfesor',
        label: 'Profesor',
        type: 'select',
        placeholder: 'Elegí un profesor',
        required: true,
        options: profesores.map((p) => ({ value: String(p.id), label: fullName(p) })),
    },
    {
        name: 'diaSemana',
        label: 'Día de la semana',
        type: 'select',
        placeholder: 'Elegí un día',
        required: true,
        options: DIAS_SEMANA.map((dia) => ({ value: dia, label: dia })),
    },
    { name: 'horaInicio', label: 'Hora de inicio', type: 'time', required: true },
    {
        name: 'horaFin',
        label: 'Hora de fin',
        type: 'time',
        required: true,
        validate: (value, values) => (values.horaInicio && value <= values.horaInicio
            ? 'La hora de fin debe ser posterior a la de inicio'
            : null),
    },
];

const filters = ({ disciplinas }) => [
    {
        name: 'disciplina',
        label: 'Disciplina',
        options: disciplinas.map((d) => ({ value: String(d.id), label: d.nombre })),
        match: (item, value) => String(item.idDisciplina) === value,
    },
];

export default function Horarios() {
    return (
        <ResourcePage
            title="Horarios"
            description="Grilla semanal de clases por disciplina y profesor."
            singular="horario"
            service={service}
            lookups={lookups}
            columns={columns}
            fields={fields}
            filters={filters}
            itemLabel={(item, ctx) => `${nombreDisciplina(item, ctx)} - ${item.diaSemana} ${item.horaInicio}`}
        />
    );
}
