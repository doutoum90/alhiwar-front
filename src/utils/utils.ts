import { CONSENT_KEY, CONSENT_VERSION } from "../constantes";
import type { AdStatus, AdType, CacheConsent, CommentStatus, NotificationsDto, UserMiniDto } from "../types";
export { formatDateTime, toDateInputValue, toIsoOrNullFromDateInput } from "./date";
export { buildPageItems, normalizePaged } from "./pagination";

export const toNumber = (v: unknown, fallback = 0) => {
    if (v === null || v === undefined) return fallback;
    if (typeof v === "number") return Number.isFinite(v) ? v : fallback;
    const n = Number(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : fallback;
};

export const normalizeType = (t: AdType | null | undefined) => {
    const v = String(t ?? "banner").toLowerCase();
    if (v === "banner" || v === "sidebar" || v === "popup" || v === "inline") return v as AdType;
    return "banner";
};

export const typeLabel = (t: AdType) => {
    switch (t) {
        case "banner":
            return "Bannière";
        case "sidebar":
            return "Barre latérale";
        case "popup":
            return "Pop-up";
        case "inline":
            return "Inline";
        default:
            return t;
    }
};

export const workflowLabel = (s: AdStatus) => {
    const v = String(s ?? "draft").toLowerCase();
    if (v === "draft") return "Brouillon";
    if (v === "in_review") return "En revue";
    if (v === "rejected") return "Rejetée";
    if (v === "published") return "Publiée";
    if (v === "archived") return "Archivée";
    return v;
};

export const workflowColor = (s: AdStatus) => {
    const v = String(s ?? "draft").toLowerCase();
    if (v === "draft") return "gray";
    if (v === "in_review") return "blue";
    if (v === "rejected") return "red";
    if (v === "published") return "green";
    if (v === "archived") return "purple";
    return "gray";
};

export const ctrPercent = (clicks: number, impressions: number) => (!impressions ? 0 : (clicks / impressions) * 100);

export const normalize = (s: string) =>
    (s || "")
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

export const toInt = (v: any, fallback = 0) => {
    const n = parseInt(String(v ?? ""), 10);
    return Number.isFinite(n) ? n : fallback;
};

export const unique = (arr: string[]) => Array.from(new Set(arr.map((x) => x.trim()).filter(Boolean)));

export const maskKey = (key?: string) => {
    if (!key) return "••••••••";
    if (key.length <= 10) return "••••••••";
    return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
};

export const defaultNotifications: NotificationsDto = { email: true, push: true, newsletter: false };

export const monthsSince = (iso?: string | null) => {
    if (!iso) return 0;
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return 0;
    return Math.max(0, Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24 * 30)));
};

export const roleBadgeColor = (role: string) => {
    switch (role) {
        case "admin":
            return "red";
        case "editor":
            return "blue";
        case "user":
            return "green";
        default:
            return "gray";
    }
};

export const roleText = (role: string) => {
    switch (role) {
        case "admin":
            return "Administrateur";
        case "editor":
            return "Éditeur";
        case "user":
            return "Utilisateur";
        default:
            return role;
    }
};


export const roleLabel = (r: string) => {
    const v = String(r || "").toLowerCase();
    if (v === "admin") return "Administrateur";
    if (v === "editor") return "Éditeur";
    if (v === "user") return "Utilisateur";
    return r || "—";
};

export const statusLabel = (s: string) => {
    const v = String(s || "").toLowerCase();
    if (v === "active") return "Actif";
    if (v === "inactive") return "Inactif";
    if (v === "suspended") return "Suspendu";
    return s || "—";
};

export const statusColor = (s: string) => {
    const v = String(s || "").toLowerCase();
    if (v === "active") return "green";
    if (v === "inactive") return "gray";
    if (v === "suspended") return "red";
    return "blue";
};

export const excerpt = (s?: string | null, n = 110) => {
    const t = String(s ?? "").trim();
    if (!t) return "—";
    if (t.length <= n) return t;
    return t.slice(0, n) + "…";
};

export const toDateLabel = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("fr-FR");
};

export function getCacheConsent(): CacheConsent | null {
    try {
        const raw = localStorage.getItem(CONSENT_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as CacheConsent;
        if (!parsed?.choice || !parsed?.createdAt) return null;
        if (parsed.version !== CONSENT_VERSION) return null; 
        return parsed;
    } catch {
        return null;
    }
}

export function setCacheConsent(choice: CacheConsent["choice"]) {
    const payload: CacheConsent = {
        version: CONSENT_VERSION,
        choice,
        createdAt: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
}


export const uniqById = (arr: UserMiniDto[]) => {
    const map = new Map<string, UserMiniDto>();
    for (const u of arr) map.set(u.id, u);
    return Array.from(map.values());
};


