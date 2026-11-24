// Vocabulario del club en la interfaz: tipos de disciplina, estados, colores y textos derivados.
// Los datos (disciplinas, inscripciones, cuotas) vienen del backend; acá solo se les da forma para mostrar.

export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export const CLUB = {
    direccion: 'Manuela Pedraza 5139',
    whatsapp: 'https://wa.me/5491165084323',
    instagram: 'https://www.instagram.com/clubpinocho/',
    maps: 'https://www.google.com/maps/search/?api=1&query=Manuela+Pedraza+5139+Villa+Urquiza+CABA',
};

// ---------- Arte de cada disciplina (cabecera de tarjeta, modal, bloques de la semana) ----------

const NARANJA = '#ff7a2e';
const BLANCO = (alpha) => `rgba(255,255,255,${alpha})`;

const ARTE = {
    futsal: {
        color: '#1d5fa8',
        pat: `linear-gradient(90deg,transparent calc(50% - 1.5px),${NARANJA} calc(50% - 1.5px),${NARANJA} calc(50% + 1.5px),transparent calc(50% + 1.5px)),radial-gradient(circle at 50% 50%,transparent 36px,${NARANJA} 37px,${NARANJA} 40px,transparent 41px)`,
    },
    basquet: {
        color: '#0b1f12',
        pat: `radial-gradient(circle at 100% 50%,transparent 70px,${NARANJA} 71px,${NARANJA} 74px,transparent 75px)`,
    },
    voley: {
        color: '#063b1e',
        pat: `linear-gradient(0deg,transparent 47%,${BLANCO('.5')} 47% 50%,transparent 50%)`,
    },
    natacion: {
        color: '#0b6e5f',
        pat: `repeating-linear-gradient(0deg,transparent 0 31px,${BLANCO('.22')} 31px 33px)`,
    },
    'patin artistico': {
        color: '#c2410c',
        pat: `repeating-radial-gradient(circle at 88% 115%,transparent 0 22px,${BLANCO('.18')} 22px 24px)`,
    },
    'gimnasia artistica': {
        color: '#0a8a3a',
        pat: `repeating-linear-gradient(-50deg,transparent 0 18px,${BLANCO('.12')} 18px 20px)`,
    },
    karate: {
        color: '#4f5e53',
        pat: `linear-gradient(-12deg,transparent 52%,${BLANCO('.85')} 52% 57%,transparent 57%)`,
    },
};

const ARTE_GENERICO = {
    color: '#0a8a3a',
    pat: `repeating-linear-gradient(-50deg,transparent 0 18px,${BLANCO('.12')} 18px 20px)`,
};

const normalizar = (texto) => String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

/** { color, ink, art } de una disciplina según su nombre (las que crea el admin usan un arte genérico). */
export function artOf(nombre) {
    const base = ARTE[normalizar(nombre)] ?? ARTE_GENERICO;
    return { color: base.color, ink: '#ffffff', art: `${base.pat},${base.color}` };
}

// ---------- Tipos de disciplina y estados ----------

export const TIPO = {
    directa: {
        label: 'Se anota directo',
        corto: 'Te anotás y el club confirma tu lugar.',
        cta: 'Anotarme',
        steps: ['Solicitada', 'Confirmada', 'A la cancha'],
        tone: 'ok',
    },
    prueba: {
        label: 'Con prueba',
        corto: 'Pedís una prueba y el club te dice si quedaste.',
        cta: 'Pedir prueba',
        steps: ['Prueba solicitada', 'Prueba agendada', 'Resultado', 'A la cancha'],
        tone: 'w',
    },
};

// [etiqueta, tono]  ·  tono: ok = verde, w = naranja (espera), bad = rojo
export const ESTADO = {
    SOLICITADA: ['Solicitada', 'w'],
    PRUEBA_SOLICITADA: ['Prueba solicitada', 'w'],
    PRUEBA_AGENDADA: ['Prueba agendada', 'w'],
    ESPERA: ['Lista de espera', 'w'],
    NO_QUEDO: ['No quedó', 'bad'],
    ACTIVA: ['A la cancha', 'ok'],
    BAJA_PENDIENTE: ['Baja pedida', 'bad'],
};

export const TONO_TINTA = { ok: '#07702f', w: '#9a3412', bad: '#a63a16' };
export const TONO_BARRA ={ ok: '#0a8a3a', w: '#ff7a2e', bad: '#c4481f' };
export const ESTADO_CUOTA = { pagada: ['Pagada', 'ok'], pendiente: ['Por pagar', 'w'], vencida: ['Vencida', 'bad'] };

// "Esperando respuesta del club"
export const EN_ESPERA = ['SOLICITADA', 'PRUEBA_SOLICITADA', 'PRUEBA_AGENDADA', 'ESPERA'];
// Inscripciones que siguen a la vista del socio (las cerradas ya no se muestran)
export const CERRADAS = ['FINALIZADA', 'CANCELADA'];

export const MEDIOS_PAGO = [
    ['tarjeta', 'Tarjeta de crédito o débito'],
    ['transferencia', 'Transferencia bancaria'],
    ['billetera', 'Billetera virtual'],
];
export const MEDIO_LABEL = Object.fromEntries(MEDIOS_PAGO);

// ---------- Formatos ----------

export const money = (n) => `$ ${Math.round(Number(n) || 0).toLocaleString('es-AR')}`;
export const cap = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);
const pad = (n) => String(n).padStart(2, '0');
export const hhmm = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;
export const isoDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function fdate(iso) {
    if (!iso) return '—';
    const [y, m, d] = String(iso).slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
}

export function periodoLabel(periodo) {
    const [y, m] = periodo.split('-');
    return `${cap(MESES[Number(m) - 1])} ${y}`;
}

export const mesCorto = (periodo) => MESES[Number(periodo.split('-')[1]) - 1].slice(0, 3).toUpperCase();

export function desdeTxt(fechaAlta) {
    if (!fechaAlta) return '';
    const [y, m] = fechaAlta.split('-').map(Number);
    return `${MESES[m - 1]} de ${y}`;
}

export const toMin = (hora) => {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
};

const unicos = (lista) => [...new Set(lista)];
const porDia = (horarios) => [...horarios].sort((a, b) => DIAS.indexOf(a.diaSemana) - DIAS.indexOf(b.diaSemana));

/** 'Lun y Mié' */
export const diasTxt = (horarios) => unicos(porDia(horarios).map((h) => DIAS_CORTOS[DIAS.indexOf(h.diaSemana)])).join(' y ');
/** '18:00–19:00' (o varias franjas separadas por " / ") */
export const horaTxt = (horarios) => unicos(porDia(horarios).map((h) => `${h.horaInicio}–${h.horaFin}`)).join(' / ');
export const horarioTxt = (horarios) => (horarios.length ? `${diasTxt(horarios)} · ${horaTxt(horarios)}` : 'A confirmar');
export const cuotaTxt = (disciplina) => (disciplina.cuotaAparte ? `+ ${money(disciplina.cuotaAparte)} por mes` : 'Incluida en la cuota social');

/** Fecha de prueba ("AAAA-MM-DDTHH:MM", hora del club) como 'sábado 6/6 a las 10:00'. */
export function fechaPruebaTxt(fechaPrueba) {
    const d = new Date(fechaPrueba);
    return `${new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'numeric' }).format(d)} a las ${hhmm(d)}`;
}

export function edad(nacimiento, now = new Date()) {
    const [y, m, d] = nacimiento.split('-').map(Number);
    let años = now.getFullYear() - y;
    if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) años -= 1;
    return años;
}

// ---------- Próximas actividades ----------

/** Próxima vez que ocurre un horario semanal: { start, end, live }. */
export function nextOccurrence(horario, now) {
    const jsDay = (DIAS.indexOf(horario.diaSemana) + 1) % 7;
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + ((jsDay - now.getDay() + 7) % 7));
    const end = new Date(start);
    start.setMinutes(toMin(horario.horaInicio));
    end.setMinutes(toMin(horario.horaFin));
    if (end <= now) {
        start.setDate(start.getDate() + 7);
        end.setDate(end.getDate() + 7);
    }
    return { start, end, live: start <= now && now < end };
}

export function whenLabel(start, now) {
    const a = new Date(start);
    a.setHours(0, 0, 0, 0);
    const b = new Date(now);
    b.setHours(0, 0, 0, 0);
    const dias = Math.round((a - b) / 864e5);
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Mañana';
    return cap(new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(start));
}

/** 'Faltan 3 h 20 min' — sin segundos. */
export function faltaTxt(ms) {
    const m = Math.max(0, Math.round(ms / 60000));
    if (m < 60) return `Faltan ${m} min`;
    if (m < 1440) return `Faltan ${Math.floor(m / 60)} h ${m % 60} min`;
    const d = Math.round(m / 1440);
    return `Faltan ${d} ${d === 1 ? 'día' : 'días'}`;
}

/** Cuándo llegó un aviso: 'Ahora', 'Hoy', 'Ayer', 'Hace 3 días'. */
export function haceTxt(fechaIso, now) {
    const f = new Date(fechaIso);
    const minutos = (now - f) / 60000;
    if (minutos < 15) return 'Ahora';
    const a = new Date(f);
    a.setHours(0, 0, 0, 0);
    const b = new Date(now);
    b.setHours(0, 0, 0, 0);
    const dias = Math.round((b - a) / 864e5);
    if (dias <= 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    return `Hace ${dias} días`;
}

// ---------- Pasos y siguiente acción de una inscripción ----------

const COLOR_PASO = { done: '#0a8a3a', cur: '#ff7a2e', bad: '#c4481f', todo: 'rgba(11,31,18,.12)' };

/** Barra de pasos: [{ label, bar, ink }] según el tipo de disciplina y el estado. */
export function stepsFor(inscripcion, disciplina) {
    const tipo = TIPO[disciplina.tipoInscripcion] ?? TIPO.directa;
    const e = inscripcion.estado;
    let estados;
    if (disciplina.tipoInscripcion === 'prueba') {
        if (e === 'PRUEBA_SOLICITADA') estados = ['done', 'cur', 'todo', 'todo'];
        else if (e === 'PRUEBA_AGENDADA' || e === 'ESPERA') estados = ['done', 'done', 'cur', 'todo'];
        else if (e === 'NO_QUEDO') estados = ['done', 'done', 'bad', 'todo'];
        else estados = ['done', 'done', 'done', 'done'];
    } else {
        estados = e === 'SOLICITADA' ? ['done', 'cur', 'todo'] : ['done', 'done', 'done'];
    }
    return estados.map((estado, i) => ({
        label: tipo.steps[i],
        bar: COLOR_PASO[estado],
        ink: estado === 'todo' ? '#4f5e53' : '#0b1f12',
    }));
}

/** Qué sigue (o cuándo se entrena) según el estado de la inscripción. */
export function accionFor(inscripcion, disciplina) {
    const e = inscripcion.estado;
    if (e === 'SOLICITADA') return 'Esperá la confirmación del club. Te avisamos acá.';
    if (e === 'PRUEBA_SOLICITADA') return 'El club te va a asignar una fecha de prueba.';
    if (e === 'PRUEBA_AGENDADA') return `Tu prueba es el ${fechaPruebaTxt(inscripcion.fechaPrueba)}.`;
    if (e === 'ESPERA') return 'Estás en lista de espera. Te avisamos si se libera un lugar.';
    if (e === 'NO_QUEDO') return 'Esta vez no quedaste. Consultá al club por las próximas pruebas.';
    if (e === 'BAJA_PENDIENTE') return 'Pediste la baja. El club se comunica con vos.';
    const horarios = porDia(disciplina.horarios ?? []);
    return horarios.length ? horarios.map((h) => `${DIAS_CORTOS[DIAS.indexOf(h.diaSemana)]} ${h.horaInicio}`).join(' y ') : 'Horario a confirmar';
}

/** Disciplinas del socio (activas o solicitadas) cuyo horario se pisa con el de `disciplina`. */
export function superposiciones(disciplina, inscripciones, disciplinaById) {
    const pisa = (a, b) => a.diaSemana === b.diaSemana && toMin(a.horaInicio) < toMin(b.horaFin) && toMin(b.horaInicio) < toMin(a.horaFin);
    const otras = inscripciones
        .filter((i) => (i.estado === 'ACTIVA' || i.estado === 'SOLICITADA') && i.idDisciplina !== disciplina.id)
        .map((i) => disciplinaById.get(i.idDisciplina))
        .filter(Boolean);
    return otras
        .map((otra) => ({
            nombre: otra.nombre,
            franjas: (otra.horarios ?? []).filter((h) => disciplina.horarios.some((x) => pisa(x, h))),
        }))
        .filter((x) => x.franjas.length > 0)
        .map((x) => `${x.nombre}: ${x.franjas.map((h) => `${h.diaSemana} ${h.horaInicio} a ${h.horaFin}`).join(', ')}`);
}

// ---------- Cuotas ----------

/** 'pagada' | 'vencida' | 'pendiente' (vencida se calcula por fecha, además de la marca del club). */
export function estadoCuota(cuota, hoyIso) {
    if (cuota.estado === 'pagada') return 'pagada';
    if (cuota.estado === 'vencida' || cuota.fechaVencimiento < hoyIso) return 'vencida';
    return 'pendiente';
}

export const concepto = (cuota, disciplinaById) =>
    (cuota.tipo === 'social' ? 'Cuota social' : disciplinaById.get(cuota.idDisciplina)?.nombre ?? 'Disciplina');

export const inicialesDe = (persona) => `${persona?.nombre?.[0] ?? ''}${persona?.apellido?.[0] ?? ''}`.toUpperCase();
