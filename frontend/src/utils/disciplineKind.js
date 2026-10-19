// Elige la ilustración según el nombre de la disciplina (sin acentos ni mayúsculas).
const normalize = (text) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

const RULES = [
    ['natacion', ['natac', 'pileta', 'swim', 'acuatic']],
    ['futbol', ['futbol', 'futsal', 'soccer']],
    ['yoga', ['yoga', 'pilates', 'meditac', 'stretch']],
    ['basquet', ['basquet', 'basket']],
    ['patin', ['patin', 'skate', 'roller']],
    ['gimnasia', ['gimnasia', 'gimnast']],
];

export function disciplineKind(nombre = '') {
    const name = normalize(nombre);
    const match = RULES.find(([, words]) => words.some((word) => name.includes(word)));
    return match ? match[0] : 'generico';
}
