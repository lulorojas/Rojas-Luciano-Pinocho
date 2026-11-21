// Comparación de franjas horarias. Las horas son texto "HH:MM", que se ordena igual que el tiempo.

// Dos franjas del mismo día se superponen si cada una empieza antes de que termine la otra.
// Que una termine justo cuando empieza la otra (19:00 y 19:00) no es superposición.
export function rangosSeSuperponen(inicioA, finA, inicioB, finB) {
    return inicioA < finB && inicioB < finA;
}
