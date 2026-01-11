// src/services/newsletterService.ts
import { apiFetch } from "./api";

export type NewsletterSubscriberDto = {
    id: string;
    email: string;
    isVerified: boolean;
    isActive: boolean;
    verifyToken?: string | null;
    verifyTokenExpiresAt?: string | null;
    unsubscribeToken?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

export type Paginated<T> = {
    items: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
};

export const newsletterService = {
    // ===== ADMIN =====
    getSubscribers(params: URLSearchParams) {
        const qs = params.toString();
        return apiFetch(`/api/newsletter/admin${qs ? `?${qs}` : ""}`) as Promise<Paginated<NewsletterSubscriberDto>>;
    },

    updateSubscriber(
        id: string,
        patch: Partial<Pick<NewsletterSubscriberDto, "isActive" | "isVerified">>
    ) {
        return apiFetch(`/api/newsletter/admin/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
        }) as Promise<NewsletterSubscriberDto>;
    },

    deleteSubscriber(id: string) {
        return apiFetch(`/api/newsletter/admin/${id}`, { method: "DELETE" }) as Promise<void>;
    },
};

