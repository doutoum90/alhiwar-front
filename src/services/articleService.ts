
import type { CommentDto } from "../types";
import { apiFetch } from "./api";

export type ArticleStatus = "draft" | "in_review" | "rejected" | "published" | "archived";
export type CommentStatus = "visible" | "pending" | "hidden";

export interface UserMiniDto {
  id: string;
  name: string;
  email?: string;
  avatar?: string | null;
  username?: string | null;
}



export type MediaType = "image" | "video" | "pdf";

export interface CategoryDto {
  id: string;
  name: string;
  slug?: string | null;
}

export type ArticleAuthorLinkDto = {
  id: string;
  articleId: string;
  userId: string;
  isMain: boolean;
  user: UserMiniDto;
};

export interface ArticleDto {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  status: ArticleStatus;

  views?: number | null;
  likesCount?: number | null;
  commentsCount?: number | null;

  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;

  categoryId?: string | null;
  category?: CategoryDto | null;

  authorId?: string | null;
  author?: UserMiniDto | null;

  tags?: string[] | null;
  authors?: ArticleAuthorLinkDto[];

  submittedAt?: string | null;
  submittedById?: string | null;
  reviewedAt?: string | null;
  reviewedById?: string | null;
  reviewComment?: string | null;
}

export interface CreateArticleDto {
  title: string;
  excerpt?: string | null;
  content: string;
  categoryId: string;
  status?: ArticleStatus;
  tags?: string[] | null;
}
export type UpdateArticleDto = Partial<CreateArticleDto>;

export interface ArticleMediaDto {
  id: string;
  articleId: string;
  type: MediaType;
  url: string;
  title?: string | null;
  position?: number | null;
  createdAt?: string;
}

export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export interface UpdateAuthorsDto {
  authorIds: string[];
}

const cleanStringOrNull = (v: unknown) => {
  if (v === undefined) return undefined;
  const s = String(v ?? "").trim();
  return s ? s : null;
};

const qs = (params: Record<string, any>) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
};

export const articleService = {
  
  getArticles(): Promise<ArticleDto[]> {
    return apiFetch("/api/articles");
  },

  getPublished(): Promise<ArticleDto[]> {
    return apiFetch("/api/articles/published");
  },

  getArchived(): Promise<ArticleDto[]> {
    return apiFetch("/api/articles/archived");
  },

  getOne(id: string): Promise<ArticleDto> {
    return apiFetch(`/api/articles/${id}`);
  },

  getBySlug(slug: string): Promise<ArticleDto> {
    return apiFetch(`/api/articles/slug/${encodeURIComponent(slug)}`);
  },

  createArticle(payload: CreateArticleDto): Promise<ArticleDto> {
    const p: any = {
      title: payload.title?.trim(),
      excerpt: payload.excerpt ?? null,
      content: payload.content,
      categoryId: payload.categoryId,
      status: payload.status,
      tags: payload.tags ?? [],
    };

    return apiFetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
  },

  updateArticle(id: string, data: UpdateArticleDto): Promise<ArticleDto> {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title.trim();
    if (data.excerpt !== undefined) payload.excerpt = cleanStringOrNull(data.excerpt);
    if (data.content !== undefined) payload.content = data.content.trim();
    if (data.categoryId !== undefined) payload.categoryId = data.categoryId;
    if (data.status !== undefined) payload.status = data.status;
    if (data.tags !== undefined) payload.tags = data.tags ?? [];

    return apiFetch(`/api/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  publishArticle(id: string): Promise<ArticleDto> {
    return apiFetch(`/api/articles/${id}/publish`, { method: "PATCH" });
  },

  unpublishArticle(id: string): Promise<ArticleDto> {
    return apiFetch(`/api/articles/${id}/unpublish`, { method: "PATCH" });
  },

  deleteArticle(id: string): Promise<void> {
    return apiFetch(`/api/articles/${id}`, { method: "DELETE" });
  },

  
  submitForReview(id: string): Promise<ArticleDto> {
    return apiFetch(`/api/articles/${id}/submit`, { method: "POST" });
  },

  getReviewQueue(): Promise<ArticleDto[]> {
    return apiFetch(`/api/articles/review-queue`);
  },

  approveArticle(id: string): Promise<ArticleDto> {
    return apiFetch(`/api/articles/${id}/approve`, { method: "POST" });
  },

  rejectArticle(id: string, comment: string): Promise<ArticleDto> {
    return apiFetch(`/api/articles/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });
  },

  
  listMedia(articleId: string): Promise<ArticleMediaDto[]> {
    return apiFetch(`/api/articles/${articleId}/media`);
  },

  addMedia(articleId: string, dto: { type: MediaType; url: string; title?: string; position?: number }): Promise<ArticleMediaDto> {
    return apiFetch(`/api/articles/${articleId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
  },

  uploadMedia(articleId: string, file: File, dto: { type: MediaType; title?: string }): Promise<ArticleMediaDto> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", dto.type);
    if (dto.title) fd.append("title", dto.title);

    return apiFetch(`/api/articles/${articleId}/media/upload`, {
      method: "POST",
      body: fd,
    });
  },

  reorderMedia(mediaId: string, dto: { position: number }): Promise<ArticleMediaDto> {
    return apiFetch(`/api/articles/media/${mediaId}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
  },

  removeMedia(mediaId: string): Promise<{ ok: true }> {
    return apiFetch(`/api/articles/media/${mediaId}`, { method: "DELETE" });
  },

  
  getAuthors(articleId: string): Promise<Array<{ userId: string; isMain: boolean; user: UserMiniDto }>> {
    return apiFetch(`/api/articles/${articleId}/authors`);
  },

  setAuthors(articleId: string, dto: UpdateAuthorsDto): Promise<any> {
    return apiFetch(`/api/articles/${articleId}/authors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
  },

  setMainAuthor(articleId: string, dto: { userId: string }): Promise<ArticleDto> {
    return apiFetch(`/api/articles/${articleId}/main-author`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
  },

  
  toggleLike(articleId: string): Promise<{ liked: boolean }> {
    return apiFetch(`/api/articles/${articleId}/like`, { method: "POST" });
  },

  isLiked(articleId: string): Promise<{ liked: boolean }> {
    return apiFetch(`/api/articles/${articleId}/like`);
  },

  
  addComment(articleId: string, dto: { content: string }): Promise<CommentDto> {
    return apiFetch(`/api/articles/${articleId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
  },

  listComments(articleId: string, params?: { page?: number; limit?: number; status?: CommentStatus }): Promise<Paged<CommentDto> | CommentDto[]> {
    return apiFetch(`/api/articles/${articleId}/comments${qs(params ?? {})}`);
  },

  moderateComment(commentId: string, status: CommentStatus) {
    return apiFetch(`/api/articles/comments/${commentId}/moderate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  },

  removeComment(commentId: string) {
    return apiFetch(`/api/articles/comments/${commentId}`, { method: "DELETE" });
  },

  
  listCommentsPublic(articleId: string, params?: { page?: number; limit?: number }): Promise<Paged<CommentDto>> {
    return apiFetch(`/api/articles/${articleId}/comments/public${qs(params ?? {})}`);
  },

  addCommentPublic(articleId: string, dto: { content: string; name?: string; email?: string }): Promise<CommentDto> {
    return apiFetch(`/api/articles/${articleId}/comments/public`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
  },
};
