import { markEnrollmentSeen } from '../services/miClubService.js';

/** El socio vio una novedad del club: deja de figurar en "Para resolver" (y se recarga el panel). */
export async function marcarVista(club, id) {
    try {
        await markEnrollmentSeen(id);
    } finally {
        club.reload();
    }
}
