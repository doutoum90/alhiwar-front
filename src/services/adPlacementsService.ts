import { apiFetch } from "./api";

export type AdPlacementDto = {
    id: string;
    key: string;
    name: string;
    provider: "manual" | "adsense" | "gam";
    format: "banner" | "sidebar" | "popup" | "inline";
    enabled: boolean;

    adsenseClientId: string | null;
    adsenseSlotId: string | null;
    adsenseFormat: string | null;
    adsenseResponsive: boolean;

    gamNetworkCode: string | null;
    gamAdUnitPath: string | null;
    gamSizes: Array<[number, number]> | null;
};

export const adPlacementsService = {
    getActive(): Promise<AdPlacementDto[]> {
        return apiFetch("/api/ads/placements/active");
    },
    getAll(): Promise<AdPlacementDto[]> {
        return apiFetch("/api/ads/placements");
    },
    create(payload: Partial<AdPlacementDto>): Promise<AdPlacementDto> {
        return apiFetch("/api/ads/placements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    },
    update(id: string, payload: Partial<AdPlacementDto>): Promise<AdPlacementDto> {
        return apiFetch(`/api/ads/placements/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    },
    remove(id: string): Promise<void> {
        return apiFetch(`/api/ads/placements/${id}`, { method: "DELETE" });
    },
};
