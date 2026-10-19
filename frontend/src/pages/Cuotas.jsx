import ResourcePage from '../components/ResourcePage.jsx';
import Badge from '../components/ui/Badge.jsx';
import { getCuotas, createCuota, updateCuota, deleteCuota } from '../services/cuotasService.js';
import { getSocios } from '../services/sociosService.js';
import { ESTADOS_CUOTA, toOptions } from '../utils/constants.js';
import { formatCurrency, formatDate, formatPeriod, fullName } from '../utils/formatters.js';

const service = {
    getAll: getCuotas,
    create: createCuota,
    update: updateCuota,
    remove: deleteCuota,
};

const lookups = { socios: getSocios };

const nombreSocio = (item, { socios }) => fullName(socios.find((s) => s.id === item.idSocio));

const columns = (ctx) => [
    { key: 'idSocio', header: 'Socio', render: (item) => nombreSocio(item, ctx) },
    { key: 'periodo', header: 'Período', sortBy: 'raw', render: (item) => formatPeriod(item.periodo) },
    { key: 'monto', header: 'Monto', align: 'right', sortBy: 'raw', render: (item) => formatCurrency(item.monto) },
    { key: 'fechaVencimiento', header: 'Vence', sortBy: 'raw', render: (item) => formatDate(item.fechaVencimiento) },
    { key: 'fechaPago', header: 'Pagada el', sortBy: 'raw', render: (item) => formatDate(item.fechaPago) },
    { key: 'estado', header: 'Estado', render: (item) => <Badge>{item.estado}</Badge> },
];

const fields = ({ socios }) => [
    {
        name: 'idSocio',
        label: 'Socio',
        type: 'select',
        placeholder: 'Elegí un socio',
        required: true,
        options: socios.map((s) => ({ value: String(s.id), label: fullName(s) })),
    },
    { name: 'periodo', label: 'Período', type: 'month', required: true },
    { name: 'monto', label: 'Monto (ARS)', type: 'number', min: 1, required: true },
    { name: 'fechaVencimiento', label: 'Fecha de vencimiento', type: 'date', required: true },
    {
        name: 'estado',
        label: 'Estado',
        type: 'select',
        required: true,
        options: toOptions(ESTADOS_CUOTA),
        defaultValue: 'pendiente',
    },
];

const filters = ({ socios }) => [
    {
        name: 'estado',
        label: 'Estado',
        options: toOptions(ESTADOS_CUOTA),
        match: (item, value) => item.estado === value,
    },
    {
        name: 'socio',
        label: 'Socio',
        options: socios.map((s) => ({ value: String(s.id), label: fullName(s) })),
        match: (item, value) => String(item.idSocio) === value,
    },
];

const extraActions = (item) => [
    {
        label: 'Registrar pago',
        primary: true,
        hidden: item.estado === 'pagada',
        run: () => updateCuota(item.id, { estado: 'pagada' }),
        success: 'Pago registrado correctamente',
    },
];

export default function Cuotas() {
    return (
        <ResourcePage
            title="Cuotas"
            description="Cuotas mensuales de los socios y su estado de pago."
            singular="cuota"
            article="a"
            service={service}
            lookups={lookups}
            columns={columns}
            fields={fields}
            filters={filters}
            extraActions={extraActions}
            itemLabel={(item, ctx) => `${nombreSocio(item, ctx)} - ${formatPeriod(item.periodo)}`}
        />
    );
}
