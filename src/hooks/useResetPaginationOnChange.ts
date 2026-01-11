import { useEffect, useRef } from "react";

/**
 * Reset pagination when dependencies change (except on first mount).
 *
 * Example:
 * useResetPaginationOnChange([q, status], () => setPage(1))
 */
export function useResetPaginationOnChange(
    deps: unknown[],
    onReset: () => void,
    options?: { skipFirst?: boolean }
) {
    const skipFirst = options?.skipFirst ?? true;
    const isFirst = useRef(true);

    useEffect(() => {
        if (skipFirst && isFirst.current) {
            isFirst.current = false;
            return;
        }
        onReset();
    }, deps);
}
