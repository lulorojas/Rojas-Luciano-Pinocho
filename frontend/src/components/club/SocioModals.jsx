import { useState } from 'react';
import DisciplinaModal from './DisciplinaModal.jsx';
import PagoModal from './PagoModal.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useMiClub } from '../../hooks/useMiClub.js';
import { useToast } from '../../hooks/useToast.js';
import {
    payCuota,
    requestClubWithdrawal,
    requestEnrollment,
    requestEnrollmentWithdrawal,
} from '../../services/miClubService.js';
import { concepto, superposiciones } from '../../utils/club.js';
import { removeIntent } from '../../utils/intent.js';

/** Los modales del panel de socio. Cuál se ve lo decide `club.modal` (ver MiClubContext). */
export default function SocioModals() {
    const club = useMiClub();
    const toast = useToast();
    const { user, setUser } = useAuth();
    const [busy, setBusy] = useState(false);
    const { target, open, hide, reset } = club.modal;

    if (!target) return null;
    const common = { open, onClose: hide, onExited: reset };

    if (target.type === 'disc') {
        const disciplina = club.disciplinaById.get(target.id);
        if (!disciplina) return null;
        const inscripcion = club.inscripcionDe(disciplina.id);
        const conflictos = inscripcion ? [] : superposiciones(disciplina, club.inscripciones, club.disciplinaById);

        const solicitar = async () => {
            setBusy(true);
            try {
                const creada = await requestEnrollment(disciplina.id);
                removeIntent(disciplina.id);
                const prueba = creada.estado === 'PRUEBA_SOLICITADA';
                toast.success(prueba ? `Pediste tu prueba de ${disciplina.nombre}` : `Pediste tu lugar en ${disciplina.nombre}`);
                hide();
                club.reload();
            } catch (err) {
                toast.error(err.message);
            } finally {
                setBusy(false);
            }
        };

        return (
            <DisciplinaModal
                {...common}
                disciplina={disciplina}
                inscripcion={inscripcion}
                conflictos={conflictos}
                blocked={Boolean(user.fechaBajaSolicitada)}
                busy={busy}
                onRequest={solicitar}
            />
        );
    }

    if (target.type === 'pago') {
        const cuota = club.cuotas.find((item) => item.id === target.id);
        if (!cuota) return null;
        const pagar = async (medio) => {
            await payCuota(cuota.id, medio);
            toast.success('Pago registrado.');
            hide();
            club.reload();
        };
        return <PagoModal {...common} cuota={cuota} concepto={concepto(cuota, club.disciplinaById)} onPay={pagar} />;
    }

    if (target.type === 'bajaDisc') {
        const inscripcion = club.inscripciones.find((item) => item.id === target.id);
        if (!inscripcion) return null;
        const nombre = club.disciplinaById.get(inscripcion.idDisciplina)?.nombre ?? 'la disciplina';
        const confirmar = async () => {
            await requestEnrollmentWithdrawal(inscripcion.id);
            toast.success(`Recibimos tu pedido de baja de ${nombre}.`);
            hide();
            club.reload();
        };
        return (
            <ConfirmModal
                {...common}
                title={`Baja de ${nombre}`}
                message="El club revisa tu pedido y se comunica con vos. Hasta entonces seguís teniendo tu lugar."
                onConfirm={confirmar}
            />
        );
    }

    if (target.type === 'bajaClub') {
        const confirmar = async () => {
            setUser(await requestClubWithdrawal());
            toast.success('Recibimos tu pedido de baja.');
            hide();
        };
        return (
            <ConfirmModal
                {...common}
                title="Pedir la baja del club"
                message="Mientras el pedido esté en trámite no vas a poder anotarte en nuevas disciplinas. El club revisa tu pedido y se comunica con vos."
                onConfirm={confirmar}
            />
        );
    }

    return null;
}
