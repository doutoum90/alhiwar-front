
import { apiFetch } from "./api";


export type Period = "7" | "30" | "90" | "365";



export interface UsersStatsSummaryDto {
  total: number;
  active: number;
  inactive: number;
  byRole: Array<{ role: string; count: string | number }>;
}



export interface ArticlesInReviewCountDto {
  count: number;
}



export interface ArticlesStatsSummaryDto {
  totalArticles: number;
  publishedArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;

  
  articlesGrowth?: number;
  viewsGrowth?: number;
  likesGrowth?: number;
  commentsGrowth?: number;
}



export interface AuthStatsSummaryDto {
  registrations: number;
  logins: number;
  registrationsGrowth?: number;
  loginsGrowth?: number;
}



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



export interface CategoriesStatsSummaryDto {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  archivedCategories: number;
}



export interface AuthorsStatsSummaryDto {
  total: number;
  active: number;
  inactive: number;
  byRole: Array<{ role: string; count: string | number }>;
}



export interface ContactUnreadCountDto {
  count: number;
}

export interface ContactStatsSummaryDto {
  totalMessages: number;
  unreadMessages: number;
  archivedMessages: number;
  last7Days: number;
}



export interface NewsletterStatsSummaryDto {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  unverified: number;
}



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
