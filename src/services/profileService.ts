import { apiFetch } from "./api";
import type { ChangePasswordDto, NotificationsDto, ProfileDto, UpdateProfileDto } from "../types";

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
      ...(data.avatar !== undefined ? { avatar: cleanStringOrNull(data.avatar) } : {}), 
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
      body: JSON.stringify(notifications), 
    });
  },

  changePassword(data: ChangePasswordDto): Promise<void> {
    return apiFetch("/api/users/me/password", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  deleteMe(): Promise<void> {
    return apiFetch("/api/users/me", { method: "DELETE" });
  },
};
