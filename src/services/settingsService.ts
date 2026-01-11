import { apiFetch } from "./api";
import type { ApiKeyDto, DbStatsDto, EmailSettingsDto, SecuritySettingsDto, SystemSettingsDto } from "../types";

export const settingsService = {
    
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
