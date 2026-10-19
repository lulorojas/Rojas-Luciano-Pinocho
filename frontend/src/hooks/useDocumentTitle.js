import { useEffect } from 'react';

const BASE_TITLE = 'Club Pinocho';

/** Cada pantalla se identifica en la pestaña y para los lectores de pantalla al navegar. */
export function useDocumentTitle(title) {
    useEffect(() => {
        document.title = title ? `${title} · ${BASE_TITLE}` : BASE_TITLE;
    }, [title]);
}
