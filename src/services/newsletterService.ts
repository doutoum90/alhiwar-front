
import { apiFetch } from "./api";
import type { NewsletterSubscriberDto, Paginated } from "../types";

export const newsletterService = {
    
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

