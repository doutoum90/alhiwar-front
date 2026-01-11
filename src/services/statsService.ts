
import { apiFetch } from "./api";
import type {
  AdsByTypeDto,
  AdsStatsSummaryDto,
  ArticlesInReviewCountDto,
  ArticlesStatsSummaryDto,
  AuthorsStatsSummaryDto,
  CategoriesStatsSummaryDto,
  ContactStatsSummaryDto,
  ContactUnreadCountDto,
  DashboardStatsDto,
  NewsletterStatsSummaryDto,
  Period,
  TopAdDto,
  UsersStatsSummaryDto,
  AuthStatsSummaryDto,
} from "../types";



export const statsService = {
  
  getUsersSummary(period: Period): Promise<UsersStatsSummaryDto> {
    return apiFetch(`/api/users/stats/summary?period=${encodeURIComponent(period)}`);
  },

  
  getAuthorsSummary(): Promise<AuthorsStatsSummaryDto> {
    return apiFetch(`/api/authors/stats/summary`);
  },

  
  getArticlesSummary(period: Period): Promise<ArticlesStatsSummaryDto> {
    return apiFetch(`/api/articles/stats/summary?period=${encodeURIComponent(period)}`);
  },

  getArticlesInReviewCount(): Promise<ArticlesInReviewCountDto> {
    return apiFetch(`/api/articles/stats/in-review-count`);
  },

  
  getAuthSummary(period: Period): Promise<AuthStatsSummaryDto> {
    return apiFetch(`/api/auth/stats/summary?period=${encodeURIComponent(period)}`);
  },

  
  getAdsSummary(): Promise<AdsStatsSummaryDto> {
    return apiFetch(`/api/ads/stats/summary`);
  },

  getAdsByType(): Promise<AdsByTypeDto[]> {
    return apiFetch(`/api/ads/stats/by-type`);
  },

  getTopAds(limit = 10): Promise<TopAdDto[]> {
    return apiFetch(`/api/ads/stats/top?limit=${encodeURIComponent(String(limit))}`);
  },

  
  getCategoriesSummary(): Promise<CategoriesStatsSummaryDto> {
    return apiFetch(`/api/categories/stats/summary`);
  },

  
  getContactSummary(): Promise<ContactStatsSummaryDto> {
    return apiFetch(`/api/contact/stats/summary`);
  },

  getContactUnreadCount(): Promise<ContactUnreadCountDto> {
    return apiFetch(`/api/contact/stats/unread-count`);
  },

  
  getNewsletterSummary(): Promise<NewsletterStatsSummaryDto> {
    return apiFetch(`/api/newsletter/stats/summary`);
  },

  
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
