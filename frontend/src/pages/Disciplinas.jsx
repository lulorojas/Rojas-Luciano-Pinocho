import ResourcePage from '../components/ResourcePage.jsx';
import Badge from '../components/ui/Badge.jsx';
import {
    getDisciplinas,
    createDisciplina,
    updateDisciplina,
    deleteDisciplina,
} from '../services/disciplinasService.js';
import { formatCurrency } from '../utils/formatters.js';

const service = {
    getAll: getDisciplinas,
    create: createDisciplina,
    update: updateDisciplina,
    remove: deleteDisciplina,
};

const columns = () => [
    { key: 'nombre', header: 'Nombre' },
    { key: 'descripcion', header: 'Descripción', render: (item) => item.descripcion || '—' },
    { key: 'cupoMaximo', header: 'Cupo máximo' },
    { key: 'cuotaMensual', header: 'Cuota mensual', align: 'right', sortBy: 'raw', render: (item) => formatCurrency(item.cuotaMensual) },
    {
        key: 'activa',
        header: 'Estado',
        render: (item) => <Badge variant={item.activa ? 'success' : 'neutral'}>{item.activa ? 'Activa' : 'Inactiva'}</Badge>,
    },
];

const fields = () => [
    { name: 'nombre', label: 'Nombre', required: true },
    { name: 'cupoMaximo', label: 'Cupo máximo', type: 'number', min: 1, required: true },
    { name: 'cuotaMensual', label: 'Cuota mensual (ARS)', type: 'number', min: 1, required: true },
    { name: 'activa', label: 'Disciplina activa', type: 'checkbox', defaultValue: true },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' },
];

export default function Disciplinas() {
    return (
        <ResourcePage
            title="Disciplinas"
            description="Actividades que ofrece el club, con su cupo y cuota mensual."
            singular="disciplina"
            article="a"
            service={service}
            columns={columns}
            fields={fields}
            itemLabel={(item) => item.nombre}
        />
    );
}
