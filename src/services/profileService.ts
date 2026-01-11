import { apiFetch } from "./api";

export type UserRole = "admin" | "user" | "editor" | string;

export interface NotificationsDto {
  email: boolean;
  push: boolean;
  newsletter: boolean;
}

export interface ProfileDto {
  id: string;
  name: string;
  email: string;
  username: string;
  bio?: string | null;
  avatar?: string | null;
  role: UserRole;

  phone?: string | null;
  location?: string | null;
  website?: string | null;
  company?: string | null;

  joinDate?: string | null;
  lastLogin?: string | null;

  articlesCount?: number | null;
  followersCount?: number | null;
  viewsCount?: number | null;

  isEmailVerified?: boolean | null;
  notifications?: NotificationsDto | null;
}

export interface UpdateProfileDto {
  name?: string;
  username?: string;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
  company?: string | null;
  avatar?: string | null;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

const cleanStringOrNull = (v: unknown) => {
  if (v === undefined) return undefined;
  const s = String(v ?? "").trim();
  return s ? s : null;
};

export const profileService = {
  getMe(): Promise<ProfileDto> {
    return apiFetch("/api/users/me");
  },

  updateMe(data: UpdateProfileDto): Promise<ProfileDto> {
    const payload: UpdateProfileDto = {
      ...(data.name !== undefined ? { name: String(data.name).trim() } : {}),
      ...(data.username !== undefined ? { username: String(data.username).trim() } : {}),
      ...(data.bio !== undefined ? { bio: cleanStringOrNull(data.bio) } : {}),
      ...(data.phone !== undefined ? { phone: cleanStringOrNull(data.phone) } : {}),
      ...(data.location !== undefined ? { location: cleanStringOrNull(data.location) } : {}),
      ...(data.website !== undefined ? { website: cleanStringOrNull(data.website) } : {}),
      ...(data.company !== undefined ? { company: cleanStringOrNull(data.company) } : {}),
      ...(data.avatar !== undefined ? { avatar: cleanStringOrNull(data.avatar) } : {}), // ✅ FIX
    };

    return apiFetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  updateNotifications(notifications: NotificationsDto): Promise<ProfileDto> {
    return apiFetch("/api/users/me/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notifications), // ✅ FIX (pas { notifications })
    });
  },

  changePassword(data: ChangePasswordDto): Promise<void> {
    return apiFetch("/api/users/me/password", { // ✅ FIX (route correcte)
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  deleteMe(): Promise<void> {
    return apiFetch("/api/users/me", { method: "DELETE" });
  },
};
