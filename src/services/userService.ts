
import { apiFetch } from "./api";
import type { UserMiniDto } from "./articleService";

export type UserRole = "admin" | "user" | "editor" | string;


export type UserStatus = "draft" | "in_review" | "rejected" | "active" | "suspended" | "archived";

export interface UserDto {
  id: string;
  name: string;
  email: string;

  role: UserRole;
  status: UserStatus;

  avatar?: string | null;
  lastLogin?: string | null;

  createdAt?: string;
  updatedAt?: string;

  articlesCount?: number | null;
  isEmailVerified?: boolean | null;

  
  submittedAt?: string | null;
  submittedById?: string | null;
  reviewedAt?: string | null;
  reviewedById?: string | null;
  reviewComment?: string | null;

  createdById?: string | null;
}

export interface UserCreateDto {
  name: string;
  email: string;
  role?: UserRole;
  status?: UserStatus; 
  isEmailVerified?: boolean;
  avatar?: string | null;
}

export type UserUpdateDto = Partial<UserCreateDto>;

const cleanStringOrNull = (v: unknown) => {
  if (v === undefined) return undefined;
  const s = String(v ?? "").trim();
  return s ? s : null;
};

export const usersService = {
  
  getUsers(): Promise<UserDto[]> {
    return apiFetch("/api/users");
  },

  getReviewQueue(): Promise<UserDto[]> {
    return apiFetch("/api/users/admin/review-queue");
  },

  getUser(id: string): Promise<UserDto> {
    return apiFetch(`/api/users/${id}`);
  },

  
  createUser(data: UserCreateDto): Promise<UserDto> {
    const payload: UserCreateDto = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role ?? "user",
      status: data.status ?? "draft",
      isEmailVerified: data.isEmailVerified ?? true,
      avatar: cleanStringOrNull(data.avatar) ?? null,
    };

    return apiFetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  updateUser(id: string, data: UserUpdateDto): Promise<UserDto> {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.email !== undefined) payload.email = data.email.trim().toLowerCase();
    if (data.role !== undefined) payload.role = data.role;
    if (data.status !== undefined) payload.status = data.status;
    if (data.isEmailVerified !== undefined) payload.isEmailVerified = data.isEmailVerified;
    if (data.avatar !== undefined) payload.avatar = cleanStringOrNull(data.avatar);

    return apiFetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  deleteUser(id: string): Promise<void> {
    return apiFetch(`/api/users/${id}`, { method: "DELETE" });
  },

  
  submitForReview(id: string): Promise<UserDto> {
    return apiFetch(`/api/users/${id}/submit`, { method: "POST" });
  },

  
  approveUser(id: string): Promise<UserDto> {
    return apiFetch(`/api/users/${id}/approve`, { method: "POST" });
  },

  rejectUser(id: string, comment: string): Promise<UserDto> {
    return apiFetch(`/api/users/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });
  },

  suspendUser(id: string): Promise<UserDto> {
    return apiFetch(`/api/users/${id}/suspend`, { method: "POST" });
  },

  activateUser(id: string): Promise<UserDto> {
    return apiFetch(`/api/users/${id}/activate`, { method: "POST" });
  },

  searchUsers(search: string, opts?: { page?: number; limit?: number }) {
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 10;

    const qs = new URLSearchParams({
      search: search.trim(),
      page: String(page),
      limit: String(limit),
    });

    return apiFetch(`/api/users?${qs.toString()}`) as Promise<{
      items: UserMiniDto[];
      total: number;
      page: number;
      limit: number;
    }>;
  },
};
