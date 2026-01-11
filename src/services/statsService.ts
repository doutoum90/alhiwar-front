// src/services/statsService.ts
import { apiFetch } from "./api";

/** Same enum you already use */
export type Period = "7" | "30" | "90" | "365";

/* ========================= USERS ========================= */

export interface UsersStatsSummaryDto {
  total: number;
  active: number;
  inactive: number;
  byRole: Array<{ role: string; count: string | number }>;
}

/* ========================= ARTICLES ========================= */

export interface ArticlesInReviewCountDto {
  count: number;
}

// You already had something like this in the front.
// Keep it, but note: the backend must return these fields.
export interface ArticlesStatsSummaryDto {
  totalArticles: number;
  publishedArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;

  // optional growth metrics if your backend returns them
  articlesGrowth?: number;
  viewsGrowth?: number;
  likesGrowth?: number;
  commentsGrowth?: number;
}

/* ========================= AUTH ========================= */

export interface AuthStatsSummaryDto {
  registrations: number;
  logins: number;
  registrationsGrowth?: number;
  loginsGrowth?: number;
}

/* ========================= ADS ========================= */

export interface AdsStatsSummaryDto {
  totalAds: number;
  activeAds: number;
  inactiveAds: number;
  expiredAds: number;

  totalImpressions: number;
  totalClicks: number;
  avgCtr: number;
  totalRevenue: number;
}

export interface AdsByTypeDto {
  type: string;
  total: number;
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
}

export interface TopAdDto {
  id: string;
  title: string;
  type: string;
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
}

/* ========================= CATEGORIES ========================= */

export interface CategoriesStatsSummaryDto {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  archivedCategories: number;
}

/* ========================= AUTHORS ========================= */

export interface AuthorsStatsSummaryDto {
  total: number;
  active: number;
  inactive: number;
  byRole: Array<{ role: string; count: string | number }>;
}

/* ========================= CONTACT ========================= */

export interface ContactUnreadCountDto {
  count: number;
}

export interface ContactStatsSummaryDto {
  totalMessages: number;
  unreadMessages: number;
  archivedMessages: number;
  last7Days: number;
}

/* ========================= NEWSLETTER ========================= */

export interface NewsletterStatsSummaryDto {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  unverified: number;
}

/* ========================= GLOBAL DASHBOARD ========================= */

export interface DashboardStatsDto {
  period: Period;

  users: UsersStatsSummaryDto;
  authors: AuthorsStatsSummaryDto;

  articles: ArticlesStatsSummaryDto;
  inReview: ArticlesInReviewCountDto;

  auth: AuthStatsSummaryDto;

  adsSummary: AdsStatsSummaryDto;
  adsByType: AdsByTypeDto[];
  topAds: TopAdDto[];

  categories: CategoriesStatsSummaryDto;

  contactSummary: ContactStatsSummaryDto;
  contactUnread: ContactUnreadCountDto;

  newsletter: NewsletterStatsSummaryDto;
}

/* ========================= SERVICE ========================= */

export const statsService = {
  /* -------- USERS -------- */
  getUsersSummary(period: Period): Promise<UsersStatsSummaryDto> {
    return apiFetch(`/api/users/stats/summary?period=${encodeURIComponent(period)}`);
  },

  /* -------- AUTHORS -------- */
  getAuthorsSummary(): Promise<AuthorsStatsSummaryDto> {
    return apiFetch(`/api/authors/stats/summary`);
  },

  /* -------- ARTICLES -------- */
  getArticlesSummary(period: Period): Promise<ArticlesStatsSummaryDto> {
    return apiFetch(`/api/articles/stats/summary?period=${encodeURIComponent(period)}`);
  },

  getArticlesInReviewCount(): Promise<ArticlesInReviewCountDto> {
    return apiFetch(`/api/articles/stats/in-review-count`);
  },

  /* -------- AUTH -------- */
  getAuthSummary(period: Period): Promise<AuthStatsSummaryDto> {
    return apiFetch(`/api/auth/stats/summary?period=${encodeURIComponent(period)}`);
  },

  /* -------- ADS -------- */
  getAdsSummary(): Promise<AdsStatsSummaryDto> {
    return apiFetch(`/api/ads/stats/summary`);
  },

  getAdsByType(): Promise<AdsByTypeDto[]> {
    return apiFetch(`/api/ads/stats/by-type`);
  },

  getTopAds(limit = 10): Promise<TopAdDto[]> {
    return apiFetch(`/api/ads/stats/top?limit=${encodeURIComponent(String(limit))}`);
  },

  /* -------- CATEGORIES -------- */
  getCategoriesSummary(): Promise<CategoriesStatsSummaryDto> {
    return apiFetch(`/api/categories/stats/summary`);
  },

  /* -------- CONTACT -------- */
  getContactSummary(): Promise<ContactStatsSummaryDto> {
    return apiFetch(`/api/contact/stats/summary`);
  },

  getContactUnreadCount(): Promise<ContactUnreadCountDto> {
    return apiFetch(`/api/contact/stats/unread-count`);
  },

  /* -------- NEWSLETTER -------- */
  getNewsletterSummary(): Promise<NewsletterStatsSummaryDto> {
    return apiFetch(`/api/newsletter/stats/summary`);
  },

  /* -------- ONE CALL (dashboard) -------- */
  async getDashboard(period: Period, opts?: { topAdsLimit?: number }): Promise<DashboardStatsDto> {
    const topAdsLimit = opts?.topAdsLimit ?? 10;

    const [
      users,
      authors,
      articles,
      inReview,
      auth,
      adsSummary,
      adsByType,
      topAds,
      categories,
      contactSummary,
      contactUnread,
      newsletter,
    ] = await Promise.all([
      this.getUsersSummary(period),
      this.getAuthorsSummary(),
      this.getArticlesSummary(period),
      this.getArticlesInReviewCount(),
      this.getAuthSummary(period),
      this.getAdsSummary(),
      this.getAdsByType(),
      this.getTopAds(topAdsLimit),
      this.getCategoriesSummary(),
      this.getContactSummary(),
      this.getContactUnreadCount(),
      this.getNewsletterSummary(),
    ]);

    return {
      period,
      users,
      authors,
      articles,
      inReview,
      auth,
      adsSummary,
      adsByType,
      topAds,
      categories,
      contactSummary,
      contactUnread,
      newsletter,
    };
  },
};
