import { DIAS_SEMANA } from './constants.js';

const todayIndex = (date) => (date.getDay() + 6) % 7; // 0 = lunes

/** Próxima fecha en que ocurre un horario semanal (hoy mismo si todavía no empezó). */
export function nextOccurrence(horario, now = new Date()) {
    const dayIndex = DIAS_SEMANA.indexOf(horario.diaSemana);
    const [hours, minutes] = horario.horaInicio.split(':').map(Number);
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + ((dayIndex - todayIndex(now) + 7) % 7));
    candidate.setHours(hours, minutes, 0, 0);
    if (candidate <= now) candidate.setDate(candidate.getDate() + 7);
    return candidate;
}

/** Texto cercano para una fecha futura: { day: 'Hoy' | 'Mañana' | 'Jueves', countdown: 'en 2 h 15 min' } */
export function describeWhen(date, now = new Date()) {
    const startOfDay = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
    const daysAway = Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000);
    const day = daysAway === 0 ? 'Hoy' : daysAway === 1 ? 'Mañana' : DIAS_SEMANA[todayIndex(date)];

    const minutes = Math.max(Math.round((date - now) / 60_000), 0);
    let countdown;
    if (minutes < 1) countdown = 'ya empieza';
    else if (minutes < 60) countdown = `en ${minutes} min`;
    else if (minutes < 24 * 60) {
        const rest = minutes % 60;
        countdown = `en ${Math.floor(minutes / 60)} h${rest ? ` ${rest} min` : ''}`;
    } else {
        const days = Math.floor(minutes / (24 * 60));
        countdown = `en ${days} ${days === 1 ? 'día' : 'días'}`;
    }
    return { day, countdown };
}

/** Días hasta una fecha ISO (negativo si ya pasó). */
export function daysUntil(isoDate, now = new Date()) {
    const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
    const target = new Date(year, month - 1, day).getTime();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return Math.round((target - today) / 86_400_000);
}
