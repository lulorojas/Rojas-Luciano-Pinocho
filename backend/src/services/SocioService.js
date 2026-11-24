// Service de Socio: reglas de negocio de las cuentas de socio (alta por el admin, registro público,
// edición del propio perfil y pedido de baja del club).
// Hacia afuera NUNCA sale el hash de la contraseña: todo pasa por sinPassword().
//
// `telefono` es el celular del socio. Los menores de edad (ver Club.EDAD_ADULTA) necesitan un adulto
// responsable con nombre, DNI y celular.

import SocioRepository from '../repositories/SocioRepository.js';
import AdministradorRepository from '../repositories/AdministradorRepository.js';
import InscripcionRepository from '../repositories/InscripcionRepository.js';
import CuotaRepository from '../repositories/CuotaRepository.js';
import BadRequestError from '../exceptions/BadRequestError.js';
import NotFoundError from '../exceptions/NotFoundError.js';
import ConflictError from '../exceptions/ConflictError.js';
import { Messages } from '../enums/Messages.js';
import { Roles } from '../enums/Roles.js';
import { Club } from '../enums/Club.js';
import { EstadoSocio } from '../enums/EstadoSocio.js';
import { hashPassword } from '../security/passwords.js';
import { sinPassword } from '../utils/serializers.js';
import { edadEn } from '../utils/fechas.js';
import { isBlank, isEmail, isFechaIso, isNonEmptyString, todayIso } from '../utils/validators.js';

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

const soloDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');
const esDni = (valor) => /^\d{7,8}$/.test(soloDigitos(valor));
const esCelular = (valor) => soloDigitos(valor).length >= 8;

function emailEnUso(email, idSocioAExcluir = null) {
    const socio = SocioRepository.findByEmail(email);
    const esOtroSocio = socio && socio.id !== idSocioAExcluir;
    return Boolean(esOtroSocio || AdministradorRepository.findByEmail(email));
}

function dniEnUso(dni, idSocioAExcluir = null) {
    const socio = SocioRepository.findByDni(soloDigitos(dni));
    return Boolean(socio && socio.id !== idSocioAExcluir);
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

function validarDni(dni, idActual = null) {
    if (!esDni(dni)) {
        throw new BadRequestError(Messages.DNI_INVALID);
    }
    if (dniEnUso(dni, idActual)) {
        throw new ConflictError(Messages.DNI_DUPLICATED);
    }
}

function esMenor(fechaNacimiento) {
    return !isBlank(fechaNacimiento) && edadEn(fechaNacimiento) < Club.EDAD_ADULTA;
}

function validarAdultoResponsable(adulto) {
    const completo =
        adulto && isNonEmptyString(adulto.nombre) && esDni(adulto.dni) && esCelular(adulto.celular);
    if (!completo) {
        throw new BadRequestError(Messages.ADULTO_RESPONSABLE_REQUIRED);
    }
}

function normalizarAdulto(adulto) {
    if (!adulto) {
        return null;
    }
    return {
        nombre: String(adulto.nombre).trim(),
        dni: soloDigitos(adulto.dni),
        celular: String(adulto.celular).trim()
    };
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
// El DNI y el adulto responsable son opcionales acá (el admin puede cargar socios con datos parciales).
function create(datos = {}) {
    validarDatos(datos);
    if (!isBlank(datos.dni)) {
        validarDni(datos.dni);
    }
    if (isBlank(datos.password)) {
        throw new BadRequestError(Messages.PASSWORD_REQUIRED);
    }
    validarPassword(datos.password);
    return sinPassword(SocioRepository.create(construir(datos, datos.estado ?? EstadoSocio.ACTIVO)));
}

// Registro público ("Hacete socio"): SIEMPRE crea un socio activo. El rol, el estado y el número de socio que
// pudiera traer el body se ignoran: nadie puede registrarse como administrador desde la API.
// Pide lo mínimo: nombre, apellido, DNI, fecha de nacimiento, celular, email y contraseña (+ adulto responsable si es menor).
function registrar(datos = {}) {
    validarDatos({ ...datos, estado: undefined });
    validarDni(datos.dni);
    if (isBlank(datos.fechaNacimiento)) {
        throw new BadRequestError(Messages.FECHA_NACIMIENTO_REQUIRED);
    }
    if (!esCelular(datos.telefono)) {
        throw new BadRequestError(Messages.CELULAR_INVALID);
    }
    if (esMenor(datos.fechaNacimiento)) {
        validarAdultoResponsable(datos.adultoResponsable);
    }
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
        dni: isBlank(datos.dni) ? '' : soloDigitos(datos.dni),
        email: String(datos.email).trim(),
        telefono: isBlank(datos.telefono) ? '' : String(datos.telefono).trim(),
        rol: Roles.SOCIO,
        passwordHash: hashPassword(String(datos.password)),
        fechaNacimiento: datos.fechaNacimiento ?? '',
        fechaAlta: todayIso(),
        adultoResponsable: esMenor(datos.fechaNacimiento) ? normalizarAdulto(datos.adultoResponsable) : null,
        fechaBajaSolicitada: null,
        estado
    };
}

// Edición por el administrador: la contraseña es opcional (si viene, reemplaza a la actual).
function update(id, datos = {}) {
    const actual = getEntidad(id);
    const merged = { ...actual, ...datos };
    validarDatos(merged, id);
    if (!isBlank(merged.dni)) {
        validarDni(merged.dni, id);
    }

    const cambios = {
        nombre: String(merged.nombre).trim(),
        apellido: String(merged.apellido).trim(),
        dni: isBlank(merged.dni) ? '' : soloDigitos(merged.dni),
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

// Lista blanca: nombre, apellido, celular, email y fecha de nacimiento. DNI, rol, estado y demás
// campos enviados se ignoran.
function updatePerfil(usuario, datos = {}) {
    if (!isNonEmptyString(datos.nombre) || !isNonEmptyString(datos.apellido)) {
        throw new BadRequestError(Messages.SOCIO_DATOS_REQUIRED);
    }
    // El email es opcional en el pedido: si no viene, se conserva el actual
    const email = isBlank(datos.email) ? usuario.email : String(datos.email).trim();
    if (!isEmail(email)) {
        throw new BadRequestError(Messages.EMAIL_INVALID);
    }
    if (emailEnUso(email, usuario.id)) {
        throw new ConflictError(Messages.EMAIL_DUPLICATED);
    }
    validarFechaNacimiento(datos.fechaNacimiento);
    if (esMenor(datos.fechaNacimiento) && !usuario.adultoResponsable) {
        throw new BadRequestError(Messages.ADULTO_RESPONSABLE_REQUIRED);
    }
    return sinPassword(
        SocioRepository.update(usuario.id, {
            nombre: datos.nombre.trim(),
            apellido: datos.apellido.trim(),
            email,
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
