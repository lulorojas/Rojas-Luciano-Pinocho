// Punto de entrada: levanta el servidor HTTP en el puerto 3000 (o el de la variable PORT).

import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
