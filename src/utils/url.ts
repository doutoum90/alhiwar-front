// utils/url.ts
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// Origin = sans /api pour servir /uploads
export const API_ORIGIN = API_BASE.replace(/\/api\/?$/i, "");

export const abs = (u?: string | null) => {
  if (!u) return undefined;
  if (u.startsWith("http")) return u;
  const path = u.startsWith("/") ? u : `/${u}`;
  return `${API_ORIGIN}${path}`;
};
