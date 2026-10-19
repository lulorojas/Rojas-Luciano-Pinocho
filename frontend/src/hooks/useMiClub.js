import { useContext } from 'react';
import { MiClubContext } from '../context/miClubContextValue.js';

export function useMiClub() {
    const context = useContext(MiClubContext);
    if (!context) throw new Error('useMiClub debe usarse dentro de <MiClubProvider>');
    return context;
}
