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
| `/inscripciones` | 401 | ve solo las propias; crea siempre como `PENDIENTE`; `POST /:id/solicitar-baja` | CRUD |
| `/cuotas` | 401 | ve solo las propias | CRUD |
| `POST /pagos/intentos` | 401 | 501 (todavía no disponible) | 501 |

### Ciclo de una inscripción

`PENDIENTE` → el admin confirma → `CONFIRMADA`. Si el socio pide la baja: una solicitud `PENDIENTE` pasa a `CANCELADA` al instante y una `CONFIRMADA` pasa a `BAJA_PENDIENTE` hasta que el admin la finaliza (`FINALIZADA`). Solo ocupan cupo las inscripciones que no están `FINALIZADA` ni `CANCELADA`.

## Seguridad

Contraseñas con `scrypt` + sal, tokens firmados con HMAC-SHA256 (8 h), el rol se vuelve a leer del servidor en cada pedido, límite de 5 intentos fallidos de login por minuto y mensajes de error idénticos para email inexistente y contraseña incorrecta. Limitaciones: datos y sesiones en memoria, sin refresh token ni recuperación de contraseña.
