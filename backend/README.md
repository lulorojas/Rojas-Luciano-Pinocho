# Backend — Club Pinocho

API Express con datos en memoria (se reinician al apagar el servidor).

```bash
npm install
npm start        # http://localhost:3000
npm test         # pruebas de autenticación y roles
```

Variables de entorno opcionales: `PORT` (por defecto 3000) y `AUTH_SECRET` (secreto de los tokens; si falta se genera uno temporal y las sesiones se pierden al reiniciar).

## Cuentas de demostración (solo desarrollo local)

Todas comparten la contraseña definida en `src/store/seedAccounts.js`.

| Rol | Email |
|---|---|
| Administrador | `admin@pinocho.test` |
| Socio | `lucia@mail.com`, `tomas@mail.com`, `sofia@mail.com` |

Cualquier persona puede registrarse desde la web, pero **solo como socio**. Los administradores únicamente existen en la semilla.

## Roles y permisos

Los permisos se aplican en el servidor (middleware `requireAuth` + `requireRole`), no solo ocultando botones en la interfaz.

| Recurso | Sin sesión | Socio | Admin |
|---|---|---|---|
| `POST /auth/login`, `POST /auth/register` | permitido | — | — |
| `GET /auth/me` | 401 | propio | propio |
| `/disciplinas`, `/horarios`, `/profesores` | 401 | solo lectura (disciplinas con `cupoDisponible`; profesores sin teléfono) | CRUD |
| `/socios` | 401 | 403 | CRUD (alta con contraseña inicial) |
| `/socios/me` | 401 | ver y editar su perfil (campos permitidos), `POST /baja` | 403 |
| `/inscripciones` | 401 | ve solo las propias; crea siempre como `pendiente`; `POST /:id/solicitar-baja` | CRUD |
| `/cuotas` | 401 | ve solo las propias | CRUD |
| `POST /pagos/intentos` | 401 | 501 (todavía no disponible) | 501 |

Seguridad: contraseñas con `scrypt` + sal, tokens firmados con HMAC-SHA256 (8 h), el rol se vuelve a leer del servidor en cada pedido, límite de 5 intentos fallidos de login por minuto y mensajes de error idénticos para email inexistente y contraseña incorrecta. Limitaciones: datos y sesiones en memoria, sin refresh token ni recuperación de contraseña.
