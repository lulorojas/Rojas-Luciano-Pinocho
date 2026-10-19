import ResourcePage from '../components/ResourcePage.jsx';
import Badge from '../components/ui/Badge.jsx';
import {
    getInscripciones,
    createInscripcion,
    updateInscripcion,
    deleteInscripcion,
} from '../services/inscripcionesService.js';
import { getSocios } from '../services/sociosService.js';
import { getDisciplinas } from '../services/disciplinasService.js';
import { ESTADOS_INSCRIPCION, toOptions } from '../utils/constants.js';
import { formatDate, fullName } from '../utils/formatters.js';

const service = {
    getAll: getInscripciones,
    create: createInscripcion,
    update: updateInscripcion,
    remove: deleteInscripcion,
};

const lookups = { socios: getSocios, disciplinas: getDisciplinas };

const nombreSocio = (item, { socios }) => fullName(socios.find((s) => s.id === item.idSocio));
const nombreDisciplina = (item, { disciplinas }) => disciplinas.find((d) => d.id === item.idDisciplina)?.nombre ?? '—';

const columns = (ctx) => [
    { key: 'idSocio', header: 'Socio', render: (item) => nombreSocio(item, ctx) },
    { key: 'idDisciplina', header: 'Disciplina', render: (item) => nombreDisciplina(item, ctx) },
    { key: 'fechaSolicitud', header: 'Solicitada', sortBy: 'raw', render: (item) => formatDate(item.fechaSolicitud) },
    { key: 'fechaConfirmacion', header: 'Confirmada', sortBy: 'raw', render: (item) => formatDate(item.fechaConfirmacion) },
    { key: 'estado', header: 'Estado', render: (item) => <Badge>{item.estado}</Badge> },
];

const fields = ({ socios, disciplinas }) => [
    {
        name: 'idSocio',
        label: 'Socio',
        type: 'select',
        placeholder: 'Elegí un socio',
        required: true,
        options: socios.map((s) => ({ value: String(s.id), label: fullName(s) })),
    },
    {
        name: 'idDisciplina',
        label: 'Disciplina',
        type: 'select',
        placeholder: 'Elegí una disciplina',
        required: true,
        options: disciplinas.filter((d) => d.activa).map((d) => ({ value: String(d.id), label: d.nombre })),
    },
    {
        name: 'estado',
        label: 'Estado',
        type: 'select',
        required: true,
        options: toOptions(ESTADOS_INSCRIPCION),
        defaultValue: 'pendiente',
    },
];

const filters = () => [
    {
        name: 'estado',
        label: 'Estado',
        options: toOptions(ESTADOS_INSCRIPCION),
        match: (item, value) => item.estado === value,
    },
];

// Acciones del flujo solicitud → confirmación → baja
const extraActions = (item) => [
    {
        label: 'Confirmar',
        primary: true,
        hidden: item.estado !== 'pendiente',
        run: () => updateInscripcion(item.id, { estado: 'confirmada' }),
        success: 'Inscripción confirmada correctamente',
    },
    {
        label: 'Dar de baja',
        hidden: item.estado === 'baja',
        confirm: {
            title: 'Dar de baja la inscripción',
            message: (nombre) => `¿Seguro que querés dar de baja la inscripción de "${nombre}"? Podés reactivarla editándola.`,
            confirmLabel: 'Dar de baja',
        },
        run: () => updateInscripcion(item.id, { estado: 'baja' }),
        success: 'Baja registrada correctamente',
    },
];

export default function Inscripciones() {
    return (
        <ResourcePage
            title="Inscripciones"
            description="Solicitudes de los socios para sumarse a una disciplina."
            singular="inscripción"
            article="a"
            service={service}
            lookups={lookups}
            columns={columns}
            fields={fields}
            filters={filters}
            extraActions={extraActions}
            itemLabel={(item, ctx) => `${nombreSocio(item, ctx)} en ${nombreDisciplina(item, ctx)}`}
        />
    );
}
