import { useEffect } from "react";

type SetPage = React.Dispatch<React.SetStateAction<number>>;

/**
 * Clamp la page actuelle dans [1..pages] quand `pages` change.
 */
export function useClampPagination(pages: number, setPage: SetPage) {
    useEffect(() => {
        const safePages = Number.isFinite(pages) && pages > 0 ? pages : 1;
        setPage((p) => Math.min(Math.max(1, p), safePages));
    }, [pages, setPage]);
}
