// Service de Inscripcion: reglas de negocio del ciclo de una inscripción.
//
//   Directa:  el socio se anota (SOLICITADA) → el club confirma (ACTIVA).
//   Prueba:   el socio pide una prueba (PRUEBA_SOLICITADA) → el club agenda la fecha (PRUEBA_AGENDADA)
//             → el club carga el resultado: ACTIVA (quedó), ESPERA (lista de espera) o NO_QUEDO.
//   Baja:     una solicitud o prueba se cancela al instante (CANCELADA); una ACTIVA pasa a BAJA_PENDIENTE
//             y el admin la finaliza (FINALIZADA).
//   Reglas:   no se inscribe un socio de baja ni uno con cuotas vencidas; el cupo y los duplicados se
//             controlan acá. Si la disciplina se pisa con otra del socio, solo se avisa (superposiciones).
//   Avisos:   cada cambio que hace el club genera un aviso para el socio y marca la inscripción como
//             `nuevo` hasta que el socio la ve. Al pasar a ACTIVA se genera la cuota de la disciplina
//             (si tiene cuota aparte).
//
// El socio solo puede ver y crear lo propio; el admin puede todo. Esa separación se resuelve acá
// (según el usuario que llega) y no en el controller.

import InscripcionRepository, { ocupaLugar } from '../repositories/InscripcionRepository.js';
import DisciplinaService from './DisciplinaService.js';
import SocioService from './SocioService.js';
import CuotaService from './CuotaService.js';
import HorarioService from './HorarioService.js';
import AvisoService from './AvisoService.js';
import BadRequestError from '../exceptions/BadRequestError.js';
import NotFoundError from '../exceptions/NotFoundError.js';
import ConflictError from '../exceptions/ConflictError.js';
import { Messages } from '../enums/Messages.js';
import { Roles } from '../enums/Roles.js';
import { EstadoInscripcion, ESTADOS_DE_PRUEBA, RESULTADOS_DE_PRUEBA } from '../enums/EstadoInscripcion.js';
import { EstadoSocio } from '../enums/EstadoSocio.js';
import { TipoInscripcion } from '../enums/TipoInscripcion.js';
import { isBlank, todayIso } from '../utils/validators.js';
import { rangosSeSuperponen } from '../utils/horarios.js';

const {
    SOLICITADA,
    PRUEBA_SOLICITADA,
    PRUEBA_AGENDADA,
    ESPERA,
    NO_QUEDO,
    ACTIVA,
    BAJA_PENDIENTE,
    FINALIZADA,
    CANCELADA
} = EstadoInscripcion;

const FECHA_PRUEBA_REGEX = /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/;

const estadoInicial = (disciplina) =>
    disciplina.tipoInscripcion === TipoInscripcion.PRUEBA ? PRUEBA_SOLICITADA : SOLICITADA;

// La hora de la prueba es hora local del club ("AAAA-MM-DDTHH:MM"); se compara contra el día de hoy.
function fechaPruebaValida(valor) {
    return (
        typeof valor === 'string' &&
        FECHA_PRUEBA_REGEX.test(valor) &&
        !Number.isNaN(Date.parse(valor)) &&
        valor.slice(0, 10) >= todayIso()
    );
}

function validarDatos({ idSocio, idDisciplina, estado, fechaPrueba }, idActual = null, esAlta = false) {
    if (isBlank(idSocio) || isBlank(idDisciplina)) {
        throw new BadRequestError(Messages.INSCRIPCION_DATOS_REQUIRED);
    }
    // Si el socio o la disciplina no existen, sus services lanzan su propio NotFoundError
    const socio = SocioService.getEntidad(idSocio);
    const disciplina = DisciplinaService.getEntidad(idDisciplina);

    if (!Object.values(EstadoInscripcion).includes(estado)) {
        throw new BadRequestError(Messages.ESTADO_INSCRIPCION_INVALID);
    }
    // Los estados de prueba solo existen en disciplinas con prueba, y SOLICITADA solo en las directas
    const esPrueba = disciplina.tipoInscripcion === TipoInscripcion.PRUEBA;
    if ((ESTADOS_DE_PRUEBA.includes(estado) && !esPrueba) || (estado === SOLICITADA && esPrueba)) {
        throw new BadRequestError(Messages.ESTADO_NO_APLICA);
    }
    if (estado === PRUEBA_AGENDADA && !fechaPruebaValida(fechaPrueba)) {
        throw new BadRequestError(Messages.PRUEBA_FECHA_INVALID);
    }
    if (esAlta) {
        if (!disciplina.activa) {
            throw new BadRequestError(Messages.DISCIPLINA_INACTIVA);
        }
        if (socio.estado === EstadoSocio.BAJA) {
            throw new BadRequestError(Messages.SOCIO_DE_BAJA);
        }
        if (CuotaService.tieneCuotasVencidas(socio.id)) {
            throw new ConflictError(Messages.SOCIO_MOROSO);
        }
    }

    // Mientras la inscripción sigue abierta (incluso en espera) no se puede pedir la misma disciplina otra vez
    if (estado !== FINALIZADA && estado !== CANCELADA) {
        if (InscripcionRepository.existeAbierta(idSocio, idDisciplina, idActual)) {
            throw new ConflictError(Messages.INSCRIPCION_DUPLICADA);
        }
    }
    // Solo cuenta contra el cupo lo que va a ocupar un lugar (una prueba o la espera no lo ocupan)
    if (ocupaLugar({ estado })) {
        if (InscripcionRepository.countQueOcupanLugar(idDisciplina, idActual) >= disciplina.cupoMaximo) {
            throw new ConflictError(Messages.SIN_CUPO);
        }
    }
}

// Completa las fechas que dependen del estado, conservando las que ya tenía la inscripción.
function construir(datos, actual = null) {
    const estado = datos.estado;
    return {
        idSocio: Number(datos.idSocio),
        idDisciplina: Number(datos.idDisciplina),
        fechaSolicitud: actual?.fechaSolicitud ?? datos.fechaSolicitud ?? todayIso(),
        fechaConfirmacion:
            estado === ACTIVA ? actual?.fechaConfirmacion ?? todayIso() : actual?.fechaConfirmacion ?? null,
        fechaBajaSolicitada:
            estado === BAJA_PENDIENTE
                ? actual?.fechaBajaSolicitada ?? todayIso()
                : actual?.fechaBajaSolicitada ?? null,
        fechaFinEfectiva: estado === FINALIZADA || estado === CANCELADA ? actual?.fechaFinEfectiva ?? todayIso() : null,
        fechaPrueba: estado === PRUEBA_AGENDADA ? datos.fechaPrueba : actual?.fechaPrueba ?? null,
        estado
    };
}

function getEntidad(id) {
    const inscripcion = InscripcionRepository.findById(id);
    if (!inscripcion) {
        throw new NotFoundError(Messages.INSCRIPCION_NOT_FOUND);
    }
    return inscripcion;
}

// El socio recibe 404 (no 403) ante una inscripción ajena: así no se revela qué ids existen.
function getPropia(usuario, id) {
    const inscripcion = getEntidad(id);
    if (inscripcion.idSocio !== usuario.id) {
        throw new NotFoundError(Messages.INSCRIPCION_NOT_FOUND);
    }
    return inscripcion;
}

function getAll(usuario) {
    if (usuario.rol === Roles.ADMIN) {
        return InscripcionRepository.findAll();
    }
    return InscripcionRepository.findBySocio(usuario.id);
}

function getById(id, usuario) {
    return usuario.rol === Roles.ADMIN ? getEntidad(id) : getPropia(usuario, id);
}

const fechaLegible = (fechaPrueba) => {
    const [dia, hora] = fechaPrueba.split('T');
    const [anio, mes, d] = dia.split('-');
    return `${d}/${mes}/${anio} a las ${hora}`;
};

// Lo que pasa cuando el CLUB cambia el estado de una inscripción: aviso al socio, marca de "nuevo"
// y, si pasa a ACTIVA, la cuota de la disciplina. Los cambios iniciados por el propio socio no pasan por acá.
function alCambiarElClub(anterior, actual) {
    if (anterior.estado === actual.estado) {
        return actual;
    }
    const disciplina = DisciplinaService.getEntidad(actual.idDisciplina);
    const nombre = disciplina.nombre;
    const esPrueba = disciplina.tipoInscripcion === TipoInscripcion.PRUEBA;
    let aviso = null;
    let nuevo = false;

    switch (actual.estado) {
        case PRUEBA_AGENDADA:
            aviso = [`Tu prueba de ${nombre} ya tiene fecha`, `${fechaLegible(actual.fechaPrueba)}, en el club.`];
            break;
        case ACTIVA:
            nuevo = true;
            aviso = esPrueba
                ? [`¡Quedaste en ${nombre}!`, 'Tu disciplina ya está activa.']
                : [`El club confirmó tu lugar en ${nombre}`, 'Ya podés ir a entrenar.'];
            CuotaService.generarCuotaDisciplina(actual.idSocio, disciplina);
            break;
        case ESPERA:
            nuevo = true;
            aviso = [`Prueba de ${nombre}: lista de espera`, 'Te avisamos si se libera un lugar.'];
            break;
        case NO_QUEDO:
            nuevo = true;
            aviso = [`Prueba de ${nombre}: esta vez no quedaste`, 'Consultá al club por las próximas pruebas.'];
            break;
        case FINALIZADA:
            if (anterior.estado === BAJA_PENDIENTE) {
                aviso = [`Tu baja de ${nombre} fue procesada`, 'Ya no figura en tu semana.'];
            }
            break;
        case CANCELADA:
            aviso = [`El club no pudo confirmar tu lugar en ${nombre}`, 'Consultá con la administración.'];
            break;
        default:
            break;
    }
    if (aviso) {
        AvisoService.crear(actual.idSocio, aviso[0], aviso[1]);
    }
    return nuevo ? InscripcionRepository.update(actual.id, { nuevo: true }) : actual;
}

// Alta por el administrador (puede fijar el estado). Sin estado, arranca como una solicitud del socio.
function create(datos = {}) {
    const disciplina = isBlank(datos.idDisciplina) ? null : DisciplinaService.getEntidad(Number(datos.idDisciplina));
    const estado = datos.estado || (disciplina ? estadoInicial(disciplina) : SOLICITADA);
    const completa = { ...datos, estado };
    validarDatos(completa, null, true);
    const creada = InscripcionRepository.create(construir(completa));
    return estado === SOLICITADA || estado === PRUEBA_SOLICITADA
        ? creada
        : alCambiarElClub({ ...creada, estado: SOLICITADA }, creada);
}

// Solicitud del propio socio: el servidor fija quién es y el estado; lo que mande el cliente se descarta.
function solicitar(usuario, idDisciplina) {
    if (usuario.fechaBajaSolicitada) {
        throw new BadRequestError(Messages.BAJA_CLUB_EN_TRAMITE);
    }
    if (isBlank(idDisciplina)) {
        throw new BadRequestError(Messages.INSCRIPCION_DATOS_REQUIRED);
    }
    const disciplina = DisciplinaService.getEntidad(Number(idDisciplina));
    const datos = { idSocio: usuario.id, idDisciplina, estado: estadoInicial(disciplina) };
    validarDatos(datos, null, true);
    const creada = InscripcionRepository.create(construir(datos));
    const prueba = disciplina.tipoInscripcion === TipoInscripcion.PRUEBA;
    AvisoService.crear(
        usuario.id,
        prueba ? `Pediste una prueba de ${disciplina.nombre}` : `Pediste tu lugar en ${disciplina.nombre}`,
        prueba ? 'El club te va a asignar una fecha.' : 'El club lo revisa y te confirma el lugar.'
    );
    return creada;
}

// Aviso para el socio antes de inscribirse: qué disciplinas suyas (activas o ya solicitadas) tienen un
// horario que se pisa con los de la disciplina elegida. No bloquea nada: el socio decide si se inscribe igual.
function superposiciones(usuario, idDisciplina) {
    if (isBlank(idDisciplina)) {
        throw new BadRequestError(Messages.INSCRIPCION_DATOS_REQUIRED);
    }
    DisciplinaService.getEntidad(idDisciplina);

    const horarios = HorarioService.getAll();
    const horariosNuevos = horarios.filter((horario) => horario.idDisciplina === idDisciplina);
    const disciplinasDelSocio = InscripcionRepository.findBySocio(usuario.id)
        .filter(
            (inscripcion) =>
                (inscripcion.estado === ACTIVA || inscripcion.estado === SOLICITADA) &&
                inscripcion.idDisciplina !== idDisciplina
        )
        .map((inscripcion) => inscripcion.idDisciplina);

    const conflictos = [];
    for (const idOtra of new Set(disciplinasDelSocio)) {
        const franjas = horarios
            .filter((horario) => horario.idDisciplina === idOtra)
            .filter((horario) =>
                horariosNuevos.some(
                    (nuevo) =>
                        nuevo.diaSemana === horario.diaSemana &&
                        rangosSeSuperponen(nuevo.horaInicio, nuevo.horaFin, horario.horaInicio, horario.horaFin)
                )
            )
            .map(({ diaSemana, horaInicio, horaFin }) => ({ diaSemana, horaInicio, horaFin }));
        if (franjas.length > 0) {
            conflictos.push({
                idDisciplina: idOtra,
                disciplina: DisciplinaService.getEntidad(idOtra).nombre,
                franjas
            });
        }
    }
    return conflictos;
}

function update(id, datos = {}) {
    const actual = getEntidad(id);
    const anterior = { ...actual };
    const merged = { ...actual, ...datos };
    validarDatos(merged, id);
    const guardada = InscripcionRepository.update(id, construir(merged, actual));
    return alCambiarElClub(anterior, guardada);
}

// El club agenda la fecha de una prueba solicitada.
function agendarPrueba(id, { fechaPrueba } = {}) {
    const inscripcion = getEntidad(id);
    if (inscripcion.estado !== PRUEBA_SOLICITADA && inscripcion.estado !== PRUEBA_AGENDADA) {
        throw new BadRequestError(Messages.PRUEBA_SOLO_EN_DISCIPLINA_CON_PRUEBA);
    }
    return update(id, { estado: PRUEBA_AGENDADA, fechaPrueba });
}

// El club carga el resultado de una prueba agendada.
function cargarResultado(id, { resultado } = {}) {
    if (!RESULTADOS_DE_PRUEBA.includes(resultado)) {
        throw new BadRequestError(Messages.RESULTADO_INVALID);
    }
    const inscripcion = getEntidad(id);
    if (inscripcion.estado !== PRUEBA_AGENDADA && inscripcion.estado !== ESPERA) {
        throw new BadRequestError(Messages.RESULTADO_SIN_PRUEBA);
    }
    return update(id, { estado: resultado });
}

// El socio vio el cambio que hizo el club: deja de figurar como novedad.
function marcarVista(usuario, id) {
    getPropia(usuario, id);
    return InscripcionRepository.update(id, { nuevo: false });
}

function remove(id) {
    getEntidad(id);
    InscripcionRepository.remove(id);
}

function solicitarBaja(usuario, id) {
    const inscripcion = getPropia(usuario, id);

    // Retirar una solicitud, una prueba o la espera la cancela al instante
    if ([SOLICITADA, PRUEBA_SOLICITADA, PRUEBA_AGENDADA, ESPERA].includes(inscripcion.estado)) {
        return InscripcionRepository.update(id, { estado: CANCELADA, fechaFinEfectiva: todayIso() });
    }
    if (inscripcion.estado === ACTIVA) {
        return InscripcionRepository.update(id, { estado: BAJA_PENDIENTE, fechaBajaSolicitada: todayIso() });
    }
    throw new BadRequestError(Messages.INSCRIPCION_YA_CERRADA);
}

export default {
    getAll,
    getById,
    create,
    solicitar,
    superposiciones,
    update,
    agendarPrueba,
    cargarResultado,
    marcarVista,
    remove,
    solicitarBaja
};
