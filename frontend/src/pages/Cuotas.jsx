import ResourcePage from '../components/ResourcePage.jsx';
import Badge from '../components/ui/Badge.jsx';
import { getCuotas, createCuota, updateCuota, deleteCuota } from '../services/cuotasService.js';
import { getSocios } from '../services/sociosService.js';
import { getDisciplinas } from '../services/disciplinasService.js';
import { ESTADOS_CUOTA, MEDIO_PAGO_LABEL, TIPOS_CUOTA, toOptions } from '../utils/constants.js';
import { formatCurrency, formatDate, formatPeriod, fullName } from '../utils/formatters.js';

const service = {
    getAll: getCuotas,
    create: createCuota,
    update: updateCuota,
    remove: deleteCuota,
};

const lookups = { socios: getSocios, disciplinas: getDisciplinas };

const nombreSocio = (item, { socios }) => fullName(socios.find((s) => s.id === item.idSocio));

const concepto = (item, { disciplinas }) => (item.tipo === 'disciplina'
    ? disciplinas.find((d) => d.id === item.idDisciplina)?.nombre ?? 'Disciplina'
    : 'Cuota social');

const columns = (ctx) => [
    { key: 'idSocio', header: 'Socio', render: (item) => nombreSocio(item, ctx) },
    { key: 'tipo', header: 'Concepto', render: (item) => concepto(item, ctx) },
    { key: 'periodo', header: 'Período', sortBy: 'raw', render: (item) => formatPeriod(item.periodo) },
    { key: 'monto', header: 'Monto', align: 'right', sortBy: 'raw', render: (item) => formatCurrency(item.monto) },
    { key: 'fechaVencimiento', header: 'Vence', sortBy: 'raw', render: (item) => formatDate(item.fechaVencimiento) },
    { key: 'fechaPago', header: 'Pagada el', sortBy: 'raw', render: (item) => formatDate(item.fechaPago) },
    { key: 'medioPago', header: 'Medio de pago', render: (item) => MEDIO_PAGO_LABEL[item.medioPago] ?? '—' },
    { key: 'estado', header: 'Estado', render: (item) => <Badge>{item.estado}</Badge> },
];

const fields = ({ socios, disciplinas }) => [
    {
        name: 'tipo',
        label: 'Tipo de cuota',
        type: 'select',
        required: true,
        options: TIPOS_CUOTA,
        defaultValue: 'social',
    },
    {
        name: 'idDisciplina',
        label: 'Disciplina',
        type: 'select',
        placeholder: 'Solo para cuotas de disciplina',
        options: disciplinas.map((d) => ({ value: String(d.id), label: d.nombre })),
        hint: 'Obligatoria si la cuota es de una disciplina; se ignora en la cuota social.',
    },
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
            description="Cuota social y cuotas por disciplina de los socios, y su estado de pago."
            singular="cuota"
            article="a"
            service={service}
            lookups={lookups}
            columns={columns}
            fields={fields}
            filters={filters}
            extraActions={extraActions}
            itemLabel={(item, ctx) => `${nombreSocio(item, ctx)} - ${concepto(item, ctx)} ${formatPeriod(item.periodo)}`}
        />
    );
}
