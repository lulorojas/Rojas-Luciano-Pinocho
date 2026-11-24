import ResourcePage from '../components/ResourcePage.jsx';
import Badge from '../components/ui/Badge.jsx';
import {
    getInscripciones,
    createInscripcion,
    updateInscripcion,
    deleteInscripcion,
    scheduleTrial,
    setTrialResult,
} from '../services/inscripcionesService.js';
import { getSocios } from '../services/sociosService.js';
import { getDisciplinas } from '../services/disciplinasService.js';
import { ESTADOS_INSCRIPCION, ESTADO_LABEL, toOptions } from '../utils/constants.js';
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

// "AAAA-MM-DDTHH:MM" -> "06/06/2026 10:00"
const formatTrial = (value) => (value ? `${formatDate(value)} ${value.slice(11, 16)}` : '—');

// Sábado próximo a las 10:00 (al menos 2 días adelante): fecha sugerida al agendar una prueba
function suggestedTrial() {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    while (date.getDay() !== 6) date.setDate(date.getDate() + 1);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T10:00`;
}

const columns = (ctx) => [
    { key: 'idSocio', header: 'Socio', render: (item) => nombreSocio(item, ctx) },
    { key: 'idDisciplina', header: 'Disciplina', render: (item) => nombreDisciplina(item, ctx) },
    { key: 'fechaSolicitud', header: 'Solicitada', sortBy: 'raw', render: (item) => formatDate(item.fechaSolicitud) },
    { key: 'fechaPrueba', header: 'Prueba', sortBy: 'raw', render: (item) => formatTrial(item.fechaPrueba) },
    { key: 'estado', header: 'Estado', render: (item) => <Badge>{ESTADO_LABEL[item.estado] ?? item.estado}</Badge> },
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
        placeholder: 'Según la disciplina (solicitada o prueba solicitada)',
        options: toOptions(ESTADOS_INSCRIPCION),
        hint: 'Las pruebas solo existen en disciplinas con prueba.',
    },
    {
        name: 'fechaPrueba',
        label: 'Fecha de la prueba',
        type: 'datetime-local',
        hint: 'Solo si la prueba está agendada.',
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

// Flujo del club. Directa: solicitada → confirmar. Con prueba: solicitada → agendar → resultado
// (quedó / lista de espera / no quedó). Baja: la pide el socio (BAJA_PENDIENTE) y el club la aprueba.
const extraActions = (item) => [
    {
        label: 'Confirmar',
        primary: true,
        hidden: item.estado !== 'SOLICITADA',
        run: () => updateInscripcion(item.id, { estado: 'ACTIVA' }),
        success: 'Inscripción confirmada correctamente',
    },
    {
        label: 'Agendar prueba',
        primary: true,
        hidden: item.estado !== 'PRUEBA_SOLICITADA',
        run: () => scheduleTrial(item.id, suggestedTrial()),
        success: 'Prueba agendada para el próximo sábado a las 10:00. Podés cambiar la fecha desde Editar.',
    },
    {
        label: 'Quedó',
        primary: true,
        hidden: !['PRUEBA_AGENDADA', 'ESPERA'].includes(item.estado),
        run: () => setTrialResult(item.id, 'ACTIVA'),
        success: 'Resultado cargado: quedó en la disciplina',
    },
    {
        label: 'Lista de espera',
        hidden: item.estado !== 'PRUEBA_AGENDADA',
        run: () => setTrialResult(item.id, 'ESPERA'),
        success: 'Resultado cargado: lista de espera',
    },
    {
        label: 'No quedó',
        hidden: item.estado !== 'PRUEBA_AGENDADA',
        confirm: {
            title: 'Cargar "no quedó"',
            message: (nombre) => `¿Seguro que querés informar que "${nombre}" no quedó? El socio recibe el aviso.`,
            confirmLabel: 'No quedó',
        },
        run: () => setTrialResult(item.id, 'NO_QUEDO'),
        success: 'Resultado cargado: no quedó',
    },
    {
        label: 'Rechazar',
        hidden: !['SOLICITADA', 'PRUEBA_SOLICITADA'].includes(item.estado),
        confirm: {
            title: 'Rechazar la solicitud',
            message: (nombre) => `¿Seguro que querés rechazar la solicitud de "${nombre}"?`,
            confirmLabel: 'Rechazar',
        },
        run: () => updateInscripcion(item.id, { estado: 'CANCELADA' }),
        success: 'Solicitud rechazada',
    },
    {
        label: 'Aprobar baja',
        primary: true,
        hidden: item.estado !== 'BAJA_PENDIENTE',
        run: () => updateInscripcion(item.id, { estado: 'FINALIZADA' }),
        success: 'Baja aprobada correctamente',
    },
    {
        label: 'Dar de baja',
        hidden: item.estado !== 'ACTIVA',
        confirm: {
            title: 'Dar de baja la inscripción',
            message: (nombre) => `¿Seguro que querés dar de baja la inscripción de "${nombre}"? Se libera su lugar en la disciplina.`,
            confirmLabel: 'Dar de baja',
        },
        run: () => updateInscripcion(item.id, { estado: 'FINALIZADA' }),
        success: 'Baja registrada correctamente',
    },
];

export default function Inscripciones() {
    return (
        <ResourcePage
            title="Inscripciones"
            description="Solicitudes y pruebas de los socios para sumarse a una disciplina."
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
