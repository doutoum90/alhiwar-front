// src/services/contactService.ts
import { apiFetch } from "./api";

export interface ContactFormData {
  message: string;
  email: string;
  name: string;
  subject: string;
}

export type ContactDto = {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  isRead: boolean;
  archivedAt?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: string;
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const contactService = {
  // ===== PUBLIC =====
  sendContactMessage(formData: ContactFormData) {
    return apiFetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  },

  // ===== ADMIN =====
  getContacts(params?: { page?: number; limit?: number; unread?: boolean; archived?: boolean }) {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.unread !== undefined) q.set("unread", String(params.unread));
    if (params?.archived !== undefined) q.set("archived", String(params.archived));
    const qs = q.toString();
    return apiFetch(`/api/contact${qs ? `?${qs}` : ""}`) as Promise<Paginated<ContactDto>>;
  },

  getContact(id: string) {
    return apiFetch(`/api/contact/${id}`) as Promise<ContactDto>;
  },

  markContactAsRead(id: string) {
    return apiFetch(`/api/contact/${id}/read`, { method: "PATCH" }) as Promise<ContactDto>;
  },

  markContactAsUnread(id: string) {
    return apiFetch(`/api/contact/${id}/unread`, { method: "PATCH" }) as Promise<ContactDto>;
  },

  markAllAsRead() {
    return apiFetch(`/api/contact/read-all`, { method: "PATCH" }) as Promise<{ affected: number }>;
  },

  archiveRead() {
    return apiFetch(`/api/contact/archive-read`, { method: "PATCH" }) as Promise<{ affected: number }>;
  },

  getUnreadCount() {
    return apiFetch("/api/contact/stats/unread-count") as Promise<{ count: number }>;
  },

  getContactsSummary() {
    return apiFetch("/api/contact/stats/summary") as Promise<{
      total: number;
      read: number;
      unread: number;
      readPercentage: number;
      monthlyStats: Array<{ month: string; count: number }>;
      topDomains: Array<{ domain: string; count: number }>;
    }>;
  },

  deleteContact(id: string) {
    return apiFetch(`/api/contact/${id}`, { method: "DELETE" }) as Promise<void>;
  },
};
