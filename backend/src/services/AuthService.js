// Service de autenticación: login, registro de socios y resolución de la sesión a partir de un token.
//
// El rol NO se confía al token: el token solo prueba identidad ({ sub, rol } firmados) y el usuario
// y su rol se vuelven a leer de los repositories en cada pedido. Si la cuenta desaparece o cambia de
// rol, el token deja de servir.

import AdministradorRepository from '../repositories/AdministradorRepository.js';
import SocioRepository from '../repositories/SocioRepository.js';
import DisciplinaRepository from '../repositories/DisciplinaRepository.js';
import SocioService from './SocioService.js';
import CuotaService from './CuotaService.js';
import AvisoService from './AvisoService.js';
import UnauthorizedError from '../exceptions/UnauthorizedError.js';
import { Messages } from '../enums/Messages.js';
import { Roles } from '../enums/Roles.js';
import { DUMMY_HASH, verifyPassword } from '../security/passwords.js';
import { createToken, verifyToken } from '../security/tokens.js';
import { createLoginLimiter } from '../security/loginLimiter.js';
import { sinPassword } from '../utils/serializers.js';

const limiter = createLoginLimiter();

// El identificador puede ser un email o, para los socios, el DNI (con o sin puntos)
function buscarPorIdentificador(identificador) {
    if (identificador.includes('@')) {
        return AdministradorRepository.findByEmail(identificador) ?? SocioRepository.findByEmail(identificador);
    }
    return SocioRepository.findByDni(identificador.replace(/\D/g, ''));
}

function buscarPorRolEId(rol, id) {
    if (rol === Roles.ADMIN) {
        return AdministradorRepository.findById(id);
    }
    if (rol === Roles.SOCIO) {
        return SocioRepository.findById(id);
    }
    return null;
}

function abrirSesion(usuario) {
    return {
        token: createToken({ sub: usuario.id, rol: usuario.rol }),
        user: sinPassword(usuario)
    };
}

function login({ email, password, ip }) {
    const emailNormalizado = String(email ?? '').trim().toLowerCase();
    const clave = `${ip}|${emailNormalizado}`;
    limiter.check(clave);

    const usuario = buscarPorIdentificador(emailNormalizado);
    // Se verifica siempre una contraseña (aunque el email no exista) y el mensaje es el mismo en
    // ambos casos: así no se puede averiguar qué cuentas existen.
    const valido = verifyPassword(String(password ?? ''), usuario?.passwordHash ?? DUMMY_HASH) && Boolean(usuario);
    if (!valido) {
        limiter.fail(clave);
        throw new UnauthorizedError(Messages.LOGIN_INVALID);
    }
    limiter.reset(clave);
    return abrirSesion(usuario);
}

// Alta de socio: crea la cuenta, genera la cuota social del mes (pendiente, vence en unos días) y deja
// el aviso de bienvenida. `disciplinasInteres` (ids que el visitante miró antes de asociarse) solo
// personaliza el aviso: no inscribe a nadie.
function register(datos = {}) {
    const socio = SocioService.registrar(datos);
    CuotaService.generarCuotaSocial(socio.id);

    const interes = (Array.isArray(datos.disciplinasInteres) ? datos.disciplinasInteres : [])
        .map((id) => DisciplinaRepository.findById(Number(id)))
        .filter((disciplina) => disciplina?.activa)
        .map((disciplina) => disciplina.nombre);
    AvisoService.crear(
        socio.id,
        '¡Bienvenido/a a Pinocho!',
        interes.length > 0
            ? `Ya sos socio. Ahora podés anotarte en ${interes.join(' y ')}.`
            : 'Ya sos socio. Elegí tu primera disciplina.'
    );
    return abrirSesion(socio);
}

// Devuelve el usuario dueño del token o lanza 401.
function resolverSesion(token) {
    const payload = verifyToken(token);
    const usuario = payload ? buscarPorRolEId(payload.rol, payload.sub) : null;
    if (!usuario || usuario.rol !== payload.rol) {
        throw new UnauthorizedError(Messages.SESSION_INVALID);
    }
    return usuario;
}

function getPerfil(usuario) {
    return sinPassword(usuario);
}

export default {
    login,
    register,
    resolverSesion,
    getPerfil
};
