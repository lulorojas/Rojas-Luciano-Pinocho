import ResourcePage from '../components/ResourcePage.jsx';
import Badge from '../components/ui/Badge.jsx';
import {
    getDisciplinas,
    createDisciplina,
    updateDisciplina,
    deleteDisciplina,
} from '../services/disciplinasService.js';
import { TIPOS_INSCRIPCION } from '../utils/constants.js';
import { formatCurrency } from '../utils/formatters.js';

const service = {
    getAll: getDisciplinas,
    create: createDisciplina,
    update: updateDisciplina,
    remove: deleteDisciplina,
};

const tipoLabel = (tipo) => TIPOS_INSCRIPCION.find((item) => item.value === tipo)?.label ?? tipo;

const columns = () => [
    { key: 'nombre', header: 'Nombre' },
    { key: 'tipoInscripcion', header: 'Inscripción', render: (item) => tipoLabel(item.tipoInscripcion) },
    { key: 'categorias', header: 'Categorías', render: (item) => item.categorias || '—' },
    { key: 'cupoMaximo', header: 'Cupo máximo' },
    {
        key: 'cuotaAparte',
        header: 'Cuota aparte',
        align: 'right',
        sortBy: 'raw',
        render: (item) => (item.cuotaAparte ? formatCurrency(item.cuotaAparte) : 'Incluida en la social'),
    },
    {
        key: 'activa',
        header: 'Estado',
        render: (item) => <Badge variant={item.activa ? 'success' : 'neutral'}>{item.activa ? 'Activa' : 'Inactiva'}</Badge>,
    },
];

const fields = () => [
    { name: 'nombre', label: 'Nombre', required: true },
    {
        name: 'tipoInscripcion',
        label: 'Cómo se anota el socio',
        type: 'select',
        required: true,
        options: TIPOS_INSCRIPCION,
        defaultValue: 'directa',
        hint: 'Con prueba: el club agenda una fecha y después informa si el socio quedó.',
    },
    { name: 'cupoMaximo', label: 'Cupo máximo', type: 'number', min: 1, required: true },
    {
        name: 'cuotaAparte',
        label: 'Cuota aparte (ARS)',
        type: 'number',
        min: 1,
        hint: 'Dejala vacía si la disciplina está incluida en la cuota social.',
    },
    { name: 'categorias', label: 'Categorías' },
    { name: 'activa', label: 'Disciplina activa', type: 'checkbox', defaultValue: true },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' },
];

export default function Disciplinas() {
    return (
        <ResourcePage
            title="Disciplinas"
            description="Actividades que ofrece el club, con su tipo de inscripción, cupo y cuota aparte."
            singular="disciplina"
            article="a"
            service={service}
            columns={columns}
            fields={fields}
            itemLabel={(item) => item.nombre}
        />
    );
}
