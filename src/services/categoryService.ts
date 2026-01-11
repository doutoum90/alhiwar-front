
import { apiFetch } from "./api";

export type CategoryStatus = "draft" | "in_review" | "rejected" | "published" | "archived";

export interface CategoryDto {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  image?: string | null;
  color?: string | null;
  status?: CategoryStatus | null;
  sortOrder?: number | null;

  submittedAt?: string | null;
  submittedById?: string | null;
  reviewedAt?: string | null;
  reviewedById?: string | null;
  reviewComment?: string | null;

  createdAt?: string;
  updatedAt?: string;
  createdById?: string | null;
}

export interface CategoryCreateDto {
  name: string;
  slug?: string | null;
  description?: string | null;
  image?: string | null;
  color?: string | null;
  sortOrder?: number;
}
export type CategoryUpdateDto = Partial<CategoryCreateDto>;

const cleanStringOrNull = (v: unknown) => {
  if (v === undefined) return undefined;
  const s = String(v ?? "").trim();
  return s ? s : null;
};

export const categoryService = {
  getCategories(): Promise<CategoryDto[]> {
    return apiFetch("/api/categories");
  },

  getPublished(): Promise<CategoryDto[]> {
    return apiFetch("/api/categories/published");
  },

  getReviewQueue(): Promise<CategoryDto[]> {
    return apiFetch("/api/categories/review-queue");
  },

  getOne(id: string): Promise<CategoryDto> {
    return apiFetch(`/api/categories/${id}`);
  },

  createCategory(data: CategoryCreateDto): Promise<CategoryDto> {
    const payload: any = {
      name: data.name?.trim(),
      slug: cleanStringOrNull(data.slug) ?? null,
      description: cleanStringOrNull(data.description) ?? null,
      image: cleanStringOrNull(data.image) ?? null,
      color: cleanStringOrNull(data.color) ?? null,
      sortOrder: Number.isFinite(data.sortOrder as any) ? Number(data.sortOrder) : 0,
    };

    return apiFetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  updateCategory(id: string, data: CategoryUpdateDto): Promise<CategoryDto> {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.slug !== undefined) payload.slug = cleanStringOrNull(data.slug);
    if (data.description !== undefined) payload.description = cleanStringOrNull(data.description);
    if (data.image !== undefined) payload.image = cleanStringOrNull(data.image);
    if (data.color !== undefined) payload.color = cleanStringOrNull(data.color);
    if (data.sortOrder !== undefined) payload.sortOrder = Number(data.sortOrder);

    return apiFetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  deleteCategory(id: string): Promise<void> {
    return apiFetch(`/api/categories/${id}`, { method: "DELETE" });
  },

  
  submitForReview(id: string): Promise<CategoryDto> {
    return apiFetch(`/api/categories/${id}/submit`, { method: "POST" });
  },

  approveCategory(id: string): Promise<CategoryDto> {
    return apiFetch(`/api/categories/${id}/approve`, { method: "POST" });
  },

  rejectCategory(id: string, comment: string): Promise<CategoryDto> {
    return apiFetch(`/api/categories/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });
  },

  archiveCategory(id: string): Promise<CategoryDto> {
    return apiFetch(`/api/categories/${id}/archive`, { method: "POST" });
  },
};
