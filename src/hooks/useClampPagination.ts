import { useEffect } from "react";
import type { SetPage } from "../types";


export function useClampPagination(pages: number, setPage: SetPage) {
    useEffect(() => {
        const safePages = Number.isFinite(pages) && pages > 0 ? pages : 1;
        setPage((p) => Math.min(Math.max(1, p), safePages));
    }, [pages, setPage]);
}
