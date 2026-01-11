import { apiFetch } from "./api";

export interface SystemSettingsDto {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    adminEmail: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    commentsEnabled: boolean;
    emailVerificationRequired: boolean;
    maxFileSize: number;
    articlesPerPage: number;
    sessionTimeout: number;
}

export interface EmailSettingsDto {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword?: string | null; // backend peut renvoyer null (masqué)
    senderName: string;
    senderEmail: string;
    enableSSL: boolean;
}

export interface SecuritySettingsDto {
    passwordMinLength: number;
    requireSpecialChars: boolean;
    sessionDuration: number;
    maxLoginAttempts: number;
    twoFactorEnabled: boolean;
    ipWhitelist: string[];
}

export interface ApiKeyDto {
    id: string;
    name: string;
    key?: string; // généralement seulement au moment de la création
    permissions: string[];
    createdAt: string;
    lastUsed?: string | null;
    isActive: boolean;
}

export interface DbStatsDto {
    totalSizeMb: number;
    totalArticles: number;
    totalUsers: number;
    lastBackupAt?: string | null;
    status: "healthy" | "degraded" | "down";
}

export const settingsService = {
    // --- settings
    getAll(): Promise<{
        system: SystemSettingsDto;
        email: EmailSettingsDto;
        security: SecuritySettingsDto;
    }> {
        return apiFetch("/api/settings");
    },

    updateSystem(payload: Partial<SystemSettingsDto>): Promise<SystemSettingsDto> {
        return apiFetch("/api/settings/system", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    },

    updateEmail(payload: Partial<EmailSettingsDto>): Promise<EmailSettingsDto> {
        return apiFetch("/api/settings/email", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    },

    updateSecurity(payload: Partial<SecuritySettingsDto>): Promise<SecuritySettingsDto> {
        return apiFetch("/api/settings/security", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    },

    // --- api keys
    listApiKeys(): Promise<ApiKeyDto[]> {
        return apiFetch("/api/api-keys");
    },

    createApiKey(payload: { name: string; permissions: string[] }): Promise<ApiKeyDto> {
        return apiFetch("/api/api-keys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    },

    toggleApiKey(id: string, isActive: boolean): Promise<ApiKeyDto> {
        return apiFetch(`/api/api-keys/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive }),
        });
    },

    deleteApiKey(id: string): Promise<void> {
        return apiFetch(`/api/api-keys/${id}`, { method: "DELETE" });
    },

    // --- db
    getDbStats(): Promise<DbStatsDto> {
        return apiFetch("/api/settings/db/stats");
    },

    runDbBackup(): Promise<{ ok: true; backupAt: string }> {
        return apiFetch("/api/settings/db/backup", { method: "POST" });
    },

    runDbOptimize(): Promise<{ ok: true }> {
        return apiFetch("/api/settings/db/optimize", { method: "POST" });
    },

    runDbCleanupLogs(): Promise<{ ok: true }> {
        return apiFetch("/api/settings/db/cleanup-logs", { method: "POST" });
    },
};
