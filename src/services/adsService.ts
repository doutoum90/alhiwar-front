
import { apiFetch } from "./api";

export type AdType = "banner" | "sidebar" | "popup" | "inline";
export type AdStatus = "draft" | "in_review" | "rejected" | "published" | "archived";

export enum AdWorkflowStatus {
  DRAFT = "draft",
  IN_REVIEW = "in_review",
  REJECTED = "rejected",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export interface AdDto {
  id: string;
  title: string;
  content: string;
  image: string | null;
  link: string | null;

  views: number;
  clicks: number;
  impressions: number;

  clickThroughRate: number;
  totalRevenue: number;

  type: AdType;
  status: AdStatus;

  startDate: string | null;
  endDate: string | null;

  createdById: string | null;

  submittedAt: string | null;
  submittedById: string | null;

  reviewedAt: string | null;
  reviewedById: string | null;
  reviewComment: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateAdDto {
  title: string;
  content: string;
  image?: string | null;
  link?: string | null;
  type?: AdType;
  startDate?: string | null;
  endDate?: string | null;
}

export type UpdateAdDto = Partial<CreateAdDto>;

const cleanStringOrNull = (v: unknown) => {
  if (v === undefined) return undefined;
  const s = String(v ?? "").trim();
  return s ? s : null;
};

export const adsService = {
  
  getAds(): Promise<AdDto[]> {
    return apiFetch("/api/ads");
  },

  getOne(id: string): Promise<AdDto> {
    return apiFetch(`/api/ads/${id}`);
  },

  
  createAd(payload: CreateAdDto): Promise<AdDto> {
    const body: any = {
      title: payload.title?.trim(),
      content: payload.content?.trim(),
      image: cleanStringOrNull(payload.image) ?? null,
      link: cleanStringOrNull(payload.link) ?? null,
      type: payload.type ?? "banner",
      startDate: payload.startDate ?? null,
      endDate: payload.endDate ?? null,
      
    };

    return apiFetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },

  updateAd(id: string, payload: UpdateAdDto): Promise<AdDto> {
    const body: any = {};
    if (payload.title !== undefined) body.title = payload.title.trim();
    if (payload.content !== undefined) body.content = payload.content.trim();
    if (payload.image !== undefined) body.image = cleanStringOrNull(payload.image);
    if (payload.link !== undefined) body.link = cleanStringOrNull(payload.link);
    if (payload.type !== undefined) body.type = payload.type;
    if (payload.startDate !== undefined) body.startDate = payload.startDate ?? null;
    if (payload.endDate !== undefined) body.endDate = payload.endDate ?? null;

    return apiFetch(`/api/ads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },

  deleteAd(id: string): Promise<void> {
    return apiFetch(`/api/ads/${id}`, { method: "DELETE" });
  },

  
  getReviewQueue(): Promise<AdDto[]> {
    return apiFetch(`/api/ads/review-queue`);
  },

  submitForReview(id: string): Promise<AdDto> {
    return apiFetch(`/api/ads/${id}/submit`, { method: "POST" });
  },



  reject(id: string, comment: string): Promise<AdDto> {
    return apiFetch(`/api/ads/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });
  },

  archive(id: string): Promise<AdDto> {
    return apiFetch(`/api/ads/${id}/archive`, { method: "POST" });
  },

  
  
  getActiveAds(): Promise<AdDto[]> {
    return apiFetch("/api/ads/active");
  },

  approve(id: string): Promise<AdDto> {
    return apiFetch(`/api/ads/${id}/approve`, { method: "POST" });
  },

  
  
  getPublished(): Promise<AdDto[]> {
    return apiFetch("/api/ads/published");
  },

  
  getPublishedByType(type: AdType): Promise<AdDto[]> {
    return apiFetch(`/api/ads/type/${encodeURIComponent(type)}`);
  },

  
  recordClick(id: string) {
    return apiFetch(`/api/ads/${id}/click`, { method: "POST" });
  },
  recordImpression(id: string) {
    return apiFetch(`/api/ads/${id}/impression`, { method: "POST" });
  },
};
