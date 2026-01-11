import { useEffect, useRef } from "react";

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
