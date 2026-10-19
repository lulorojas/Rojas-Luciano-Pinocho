// Service de Socio: reglas de negocio de las cuentas de socio (alta por el admin, registro público,
// edición del propio perfil y pedido de baja del club).
// Hacia afuera NUNCA sale el hash de la contraseña: todo pasa por sinPassword().

import SocioRepository from '../repositories/SocioRepository.js';
import AdministradorRepository from '../repositories/AdministradorRepository.js';
import InscripcionRepository from '../repositories/InscripcionRepository.js';
import CuotaRepository from '../repositories/CuotaRepository.js';
import BadRequestError from '../exceptions/BadRequestError.js';
import NotFoundError from '../exceptions/NotFoundError.js';
import ConflictError from '../exceptions/ConflictError.js';
import { Messages } from '../enums/Messages.js';
import { Roles } from '../enums/Roles.js';
import { EstadoSocio } from '../enums/EstadoSocio.js';
import { hashPassword } from '../security/passwords.js';
import { sinPassword } from '../utils/serializers.js';
import { isBlank, isEmail, isFechaIso, isNonEmptyString, todayIso } from '../utils/validators.js';

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

function emailEnUso(email, idSocioAExcluir = null) {
    const socio = SocioRepository.findByEmail(email);
    const esOtroSocio = socio && socio.id !== idSocioAExcluir;
    return Boolean(esOtroSocio || AdministradorRepository.findByEmail(email));
}

function validarPassword(password) {
    if (String(password).length < MIN_PASSWORD) {
        throw new BadRequestError(Messages.PASSWORD_SHORT);
    }
    if (String(password).length > MAX_PASSWORD) {
        throw new BadRequestError(Messages.PASSWORD_LONG);
    }
}

function validarFechaNacimiento(valor) {
    if (isBlank(valor)) {
        return;
    }
    if (!isFechaIso(valor)) {
        throw new BadRequestError(Messages.FECHA_NACIMIENTO_INVALID);
    }
    if (valor > todayIso()) {
        throw new BadRequestError(Messages.FECHA_NACIMIENTO_FUTURA);
    }
}

function validarDatos({ nombre, apellido, email, estado, fechaNacimiento }, idActual = null) {
    if (!isNonEmptyString(nombre) || !isNonEmptyString(apellido) || !isNonEmptyString(email)) {
        throw new BadRequestError(Messages.SOCIO_DATOS_REQUIRED);
    }
    if (!isEmail(email)) {
        throw new BadRequestError(Messages.EMAIL_INVALID);
    }
    if (emailEnUso(email, idActual)) {
        throw new ConflictError(Messages.EMAIL_DUPLICATED);
    }
    if (estado !== undefined && !Object.values(EstadoSocio).includes(estado)) {
        throw new BadRequestError(Messages.ESTADO_SOCIO_INVALID);
    }
    validarFechaNacimiento(fechaNacimiento);
}

function getEntidad(id) {
    const socio = SocioRepository.findById(id);
    if (!socio) {
        throw new NotFoundError(Messages.SOCIO_NOT_FOUND);
    }
    return socio;
}

function getAll() {
    return SocioRepository.findAll().map(sinPassword);
}

function getById(id) {
    return sinPassword(getEntidad(id));
}

// Alta por el administrador: define una contraseña inicial y puede fijar el estado.
function create(datos = {}) {
    validarDatos(datos);
    if (isBlank(datos.password)) {
        throw new BadRequestError(Messages.PASSWORD_REQUIRED);
    }
    validarPassword(datos.password);
    return sinPassword(SocioRepository.create(construir(datos, datos.estado ?? EstadoSocio.ACTIVO)));
}

// Registro público: SIEMPRE crea un socio activo. El rol, el estado y el número de socio que
// pudiera traer el body se ignoran: nadie puede registrarse como administrador desde la API.
function registrar(datos = {}) {
    validarDatos({ ...datos, estado: undefined });
    if (isBlank(datos.password)) {
        throw new BadRequestError(Messages.PASSWORD_REQUIRED);
    }
    validarPassword(datos.password);
    return SocioRepository.create(construir(datos, EstadoSocio.ACTIVO));
}

function construir(datos, estado) {
    return {
        nombre: String(datos.nombre).trim(),
        apellido: String(datos.apellido).trim(),
        email: String(datos.email).trim(),
        telefono: isBlank(datos.telefono) ? '' : String(datos.telefono).trim(),
        rol: Roles.SOCIO,
        passwordHash: hashPassword(String(datos.password)),
        fechaNacimiento: datos.fechaNacimiento ?? '',
        fechaAlta: todayIso(),
        fechaBajaSolicitada: null,
        estado
    };
}

// Edición por el administrador: la contraseña es opcional (si viene, reemplaza a la actual).
function update(id, datos = {}) {
    const actual = getEntidad(id);
    const merged = { ...actual, ...datos };
    validarDatos(merged, id);

    const cambios = {
        nombre: String(merged.nombre).trim(),
        apellido: String(merged.apellido).trim(),
        email: String(merged.email).trim(),
        telefono: isBlank(merged.telefono) ? '' : String(merged.telefono).trim(),
        fechaNacimiento: merged.fechaNacimiento ?? '',
        estado: merged.estado ?? actual.estado
    };
    if (!isBlank(datos.password)) {
        validarPassword(datos.password);
        cambios.passwordHash = hashPassword(String(datos.password));
    }
    return sinPassword(SocioRepository.update(id, cambios));
}

function remove(id) {
    getEntidad(id);
    const tieneRegistros =
        InscripcionRepository.findBySocio(id).length > 0 || CuotaRepository.findBySocio(id).length > 0;
    if (tieneRegistros) {
        throw new ConflictError(Messages.SOCIO_CON_REGISTROS);
    }
    SocioRepository.remove(id);
}

// ---- Perfil propio (rol socio) ----

function getPerfil(usuario) {
    return sinPassword(usuario);
}

// Lista blanca: email, rol, estado y demás campos enviados se ignoran.
function updatePerfil(usuario, datos = {}) {
    if (!isNonEmptyString(datos.nombre) || !isNonEmptyString(datos.apellido)) {
        throw new BadRequestError(Messages.SOCIO_DATOS_REQUIRED);
    }
    validarFechaNacimiento(datos.fechaNacimiento);
    return sinPassword(
        SocioRepository.update(usuario.id, {
            nombre: datos.nombre.trim(),
            apellido: datos.apellido.trim(),
            telefono: isBlank(datos.telefono) ? '' : String(datos.telefono).trim(),
            fechaNacimiento: datos.fechaNacimiento ?? ''
        })
    );
}

// Pedido de baja del club: el administrador lo ve y lo procesa; no se borra nada.
function pedirBajaClub(usuario) {
    if (usuario.fechaBajaSolicitada) {
        throw new BadRequestError(Messages.BAJA_CLUB_YA_PEDIDA);
    }
    return sinPassword(SocioRepository.update(usuario.id, { fechaBajaSolicitada: todayIso() }));
}

export default {
    getAll,
    getById,
    getEntidad,
    create,
    registrar,
    update,
    remove,
    getPerfil,
    updatePerfil,
    pedirBajaClub
};
