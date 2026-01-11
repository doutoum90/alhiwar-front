import type { MeDto } from '../types';
import { apiFetch } from './api'

export type LoginResponse = {
    access_token: string;
    refresh_token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar?: string | null;
        isActive: boolean;
    };
};

const AUTH_API_ENDPOINTS = '/api/auth';

export function login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    return apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });
}

export function register(data: any) {
    return apiFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
}
export async function fetchUser(): Promise<MeDto | null> {
    
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    
    return apiFetch("/api/auth/me");
}

export function refreshToken(): Promise<{ access_token: string }> {
    const refresh = localStorage.getItem("refresh_token");
    return apiFetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
    });
}

export const logout = async (): Promise<void> => {
    try {
        await apiFetch(`${AUTH_API_ENDPOINTS}/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }), 
        });
    } catch (error) {
        console.error('Logout API error:', error);
    } finally {
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
};

export function resetPassword(email: string) {
    return apiFetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
}

export const authService = {

    async getProfile() {
        return apiFetch(`${AUTH_API_ENDPOINTS}/me`);
    },

    async updateProfile(data: any) {
        return apiFetch(`${AUTH_API_ENDPOINTS}/profile`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    async changePassword(data: any) {
        return apiFetch(`${AUTH_API_ENDPOINTS}/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    async logout() {
        const refreshToken = localStorage.getItem('refresh_token');
        try {
            await apiFetch(`${AUTH_API_ENDPOINTS}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
            });
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    }
}