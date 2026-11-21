# Backend — Club Pinocho

API Express con datos en memoria (se reinician al apagar el servidor), organizada en capas:

```
src/
├── routes/        endpoints y qué rol puede usar cada uno
├── controllers/   leen el request y devuelven la respuesta
├── services/      reglas de negocio y validaciones
├── repositories/  único acceso a los datos en memoria (con la semilla)
├── middlewares/   auth (requireAuth, requireRole) y manejo de errores
├── security/      hash de contraseñas, tokens firmados y límite de intentos
├── exceptions/    errores de negocio con su código HTTP
├── enums/         estados, roles y mensajes
├── responses/     formato único de respuesta
└── utils/         validadores y serializadores
```

```bash
npm install
npm start        # http://localhost:3000/api
npm test         # pruebas de autenticación y roles
```

Variables de entorno opcionales: `PORT` (por defecto 3000) y `AUTH_SECRET` (secreto de los tokens; si falta se genera uno temporal y las sesiones se pierden al reiniciar).

## Formato de respuesta

Todo cuelga de `/api`. Éxito: `{ "success": true, "data": ... }`. Error: `{ "success": false, "message": "..." }`.

## Cuentas de demostración (solo desarrollo local)

Todas comparten la contraseña definida en `src/security/demoPassword.js`.

| Rol | Email |
|---|---|
| Administrador | `admin@pinocho.test` |
| Socio | `lucia@mail.com`, `tomas@mail.com`, `sofia@mail.com` |

Cualquier persona puede registrarse desde la web, pero **solo como socio**. Los administradores únicamente existen en la semilla.

## Roles y permisos

Los permisos se aplican en el servidor (`requireAuth` + `requireRole` en las rutas), no solo ocultando botones en la interfaz.

| Recurso | Sin sesión | Socio | Admin |
|---|---|---|---|
| `POST /auth/login`, `POST /auth/register` | permitido | — | — |
| `GET /public/disciplinas` | permitido (activas, solo datos comerciales) | permitido | permitido |
| `GET /auth/me` | 401 | propio | propio |
| `/disciplinas`, `/horarios`, `/profesores` | 401 | solo lectura (disciplinas con `cupoDisponible`; profesores sin teléfono) | CRUD |
| `/socios` | 401 | 403 | CRUD (alta con contraseña inicial) |
| `/socios/me` | 401 | ver y editar su perfil (campos permitidos), `POST /me/baja` | 403 |
| `/inscripciones` | 401 | ve solo las propias; crea siempre como `PENDIENTE`; `POST /:id/solicitar-baja`; `GET /superposiciones?idDisciplina=` | CRUD |
| `/cuotas` | 401 | ve solo las propias; `POST /:id/pagar` | CRUD |

### Ciclo de una inscripción

`PENDIENTE` → el admin confirma → `CONFIRMADA`. Si el socio pide la baja: una solicitud `PENDIENTE` pasa a `CANCELADA` al instante y una `CONFIRMADA` pasa a `BAJA_PENDIENTE` hasta que el admin la finaliza (`FINALIZADA`). Solo ocupan cupo las inscripciones que no están `FINALIZADA` ni `CANCELADA`.

## Reglas de negocio

Todas se validan en los services (el frontend solo las muestra). Los errores salen con el formato `{ success: false, message }` y su código HTTP.

| Regla | Dónde | Error |
|---|---|---|
| Datos obligatorios y con formato válido en todas las entidades | services | 400 |
| Registros duplicados: email de socio, nombre de disciplina, inscripción activa del mismo socio en la misma disciplina, **cuota del mismo socio y período** | services | 409 |
| Cupo máximo de cada disciplina | `InscripcionService` | 409 |
| **Un profesor no puede dar dos clases a la vez** (mismo día y horarios que se pisan; una a continuación de la otra sí) | `HorarioService` | 409 |
| **Un socio con cuotas vencidas no puede inscribirse** (cuota `vencida`, o no pagada y pasada de fecha) | `InscripcionService` | 409 |
| **Un socio de baja no puede inscribirse ni pagar cuotas** (sí ver su historial) | `InscripcionService`, `CuotaService` | 400 |
| No se eliminan disciplinas con inscripciones vigentes, profesores con horarios ni socios con registros | services | 409 |
| Recursos inexistentes, o ajenos para un socio | services | 404 |

### Pago de una cuota — `POST /api/cuotas/:id/pagar` (socio)

Body `{ "medioPago": "tarjeta" | "transferencia" | "billetera" }`. El servidor valida que la cuota sea del socio (si no, 404), que no esté pagada (409) y que el medio sea válido (400); el importe sale de la cuota. La marca `pagada` con la fecha de hoy y el medio elegido. No se manejan datos de tarjeta.

### Aviso de superposición — `GET /api/inscripciones/superposiciones?idDisciplina=`

Devuelve `[{ idDisciplina, disciplina, franjas: [{ diaSemana, horaInicio, horaFin }] }]` con las disciplinas vigentes del socio cuyo horario se pisa con la elegida. Es solo un aviso: el socio puede inscribirse igual.

## Seguridad

Contraseñas con `scrypt` + sal, tokens firmados con HMAC-SHA256 (8 h), el rol se vuelve a leer del servidor en cada pedido, límite de 5 intentos fallidos de login por minuto y mensajes de error idénticos para email inexistente y contraseña incorrecta. Limitaciones: datos y sesiones en memoria, sin refresh token ni recuperación de contraseña.
