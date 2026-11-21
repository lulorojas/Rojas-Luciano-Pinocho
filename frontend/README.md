# Frontend — Club Pinocho

React + Vite. Consume la API del backend (`../backend`) y está organizado por responsabilidades:

```
src/
├── assets/       logo e ilustraciones
├── components/   componentes reutilizables (ui/, layout/, notifications/, socio/)
├── context/      sesión (AuthContext) y datos del socio (MiClubContext)
├── hooks/        useResource, useToast, useAuth, etc.
├── pages/        pantallas (admin, socio y públicas)
├── services/     único lugar donde se hace fetch (api.js + un archivo por recurso)
├── utils/        validadores, formateadores y constantes
├── styles/       CSS compartido
├── App.jsx       rutas y navegación
└── main.jsx      punto de entrada
```

## Cómo ejecutarlo

1. Levantar el backend (`cd backend && npm install && npm start`, queda en http://localhost:3000).
2. Copiar `.env.example` a `.env` (la URL del backend se configura en `VITE_API_URL`).
3. En esta carpeta:

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de producción
npm run lint
```

Cuentas de demostración: ver `backend/README.md`.

## Criterios cubiertos

- Peticiones centralizadas en `src/services` (los componentes nunca llaman a `fetch`).
- Notificaciones de éxito y error con un único sistema de toasts.
- Estados de carga, de error y de vacío reutilizables.
- Validación de formularios con mensajes asociados a cada campo.
- Confirmación (`ConfirmDialog`) antes de eliminar.
- Accesibilidad: `label` asociados, botones semánticos, enlace "Saltar al contenido", foco al navegar.
