import ResourcePage from '../components/ResourcePage.jsx';
import Badge from '../components/ui/Badge.jsx';
import { getSocios, createSocio, updateSocio, deleteSocio } from '../services/sociosService.js';
import { ESTADOS_SOCIO, toOptions } from '../utils/constants.js';
import { formatDate, fullName } from '../utils/formatters.js';

const service = {
    getAll: getSocios,
    create: createSocio,
    update: updateSocio,
    remove: deleteSocio,
};

const columns = () => [
    { key: 'numeroSocio', header: 'N.º de socio' },
    { key: 'nombre', header: 'Nombre', render: fullName },
    { key: 'email', header: 'Email' },
    { key: 'telefono', header: 'Teléfono', render: (item) => item.telefono || '—' },
    { key: 'fechaAlta', header: 'Alta', sortBy: 'raw', render: (item) => formatDate(item.fechaAlta) },
    {
        key: 'fechaBajaSolicitada',
        header: 'Baja del club',
        sortBy: 'raw',
        render: (item) => (item.fechaBajaSolicitada
            ? <Badge variant="warning">Pedida el {formatDate(item.fechaBajaSolicitada)}</Badge>
            : '—'),
    },
    { key: 'estado', header: 'Estado', render: (item) => <Badge>{item.estado}</Badge> },
];

const fields = (ctx, item) => [
    // La contraseña inicial solo se define al dar de alta; el socio la usa para entrar a su cuenta
    ...(item ? [] : [{
        name: 'password',
        label: 'Contraseña inicial',
        type: 'password',
        required: true,
        hint: 'Mínimo 8 caracteres. El socio puede usarla para ingresar.',
        validate: (value) => (String(value).length < 8 ? 'Debe tener al menos 8 caracteres' : null),
    }]),
    { name: 'nombre', label: 'Nombre', required: true },
    { name: 'apellido', label: 'Apellido', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'telefono', label: 'Teléfono', hint: 'Solo números, con código de área.' },
    { name: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date' },
    {
        name: 'estado',
        label: 'Estado',
        type: 'select',
        options: toOptions(ESTADOS_SOCIO),
        required: true,
        defaultValue: 'activo',
    },
];

export default function Socios() {
    return (
        <ResourcePage
            title="Socios"
            description="Personas asociadas al club."
            singular="socio"
            service={service}
            columns={columns}
            fields={fields}
            itemLabel={fullName}
        />
    );
}
