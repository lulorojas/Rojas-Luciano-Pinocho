import ResourcePage from '../components/ResourcePage.jsx';
import {
    getProfesores,
    createProfesor,
    updateProfesor,
    deleteProfesor,
} from '../services/profesoresService.js';
import { fullName } from '../utils/formatters.js';

const service = {
    getAll: getProfesores,
    create: createProfesor,
    update: updateProfesor,
    remove: deleteProfesor,
};

const columns = () => [
    { key: 'nombre', header: 'Nombre', render: fullName },
    { key: 'especialidad', header: 'Especialidad' },
    { key: 'telefono', header: 'Teléfono', render: (item) => item.telefono || '—' },
];

const fields = () => [
    { name: 'nombre', label: 'Nombre', required: true },
    { name: 'apellido', label: 'Apellido', required: true },
    { name: 'especialidad', label: 'Especialidad', required: true },
    { name: 'telefono', label: 'Teléfono' },
];

export default function Profesores() {
    return (
        <ResourcePage
            title="Profesores"
            description="Equipo docente del club."
            singular="profesor"
            service={service}
            columns={columns}
            fields={fields}
            itemLabel={fullName}
        />
    );
}
