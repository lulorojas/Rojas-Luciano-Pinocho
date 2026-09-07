// Punto de entrada: levanta el servidor HTTP en el puerto 3000.

import app from './app.js';

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
