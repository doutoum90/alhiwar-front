import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { TableProps } from "@chakra-ui/react";

export type SetPage = Dispatch<SetStateAction<number>>;

export type AdType = "banner" | "sidebar" | "popup" | "inline";
export type AdStatus = "draft" | "in_review" | "rejected" | "published" | "archived";

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
  link?: string | null;
  image?: string | null;
  type?: AdType;
  startDate?: string | null;
  endDate?: string | null;
}

export type UpdateAdDto = Partial<CreateAdDto>;

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

export type UpdateAuthorsDto = {
  authorIds: string[];
};

export type ContactFormData = {
  message: string;
  email: string;
  name: string;
  subject: string;
};

export type ContactDto = {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  isRead: boolean;
  archivedAt?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: string;
};

export type NewsletterSubscriberDto = {
  id: string;
  email: string;
  isVerified: boolean;
  isActive: boolean;
  verifyToken?: string | null;
  verifyTokenExpiresAt?: string | null;
  unsubscribeToken?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Paginated<T> = {
  items?: T[];
  data?: T[];
  total: number;
  page: number;
  limit: number;
  pages?: number;
  totalPages?: number;
};

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

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    isActive: boolean;
  };
};

export interface SystemSettingsDto {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  timezone: string;
  language: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  commentsEnabled: boolean;
  emailVerificationRequired: boolean;
  maxFileSize: number;
  articlesPerPage: number;
  sessionTimeout: number;
}

export interface EmailSettingsDto {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword?: string | null;
  senderName: string;
  senderEmail: string;
  enableSSL: boolean;
}

export interface SecuritySettingsDto {
  passwordMinLength: number;
  requireSpecialChars: boolean;
  sessionDuration: number;
  maxLoginAttempts: number;
  twoFactorEnabled: boolean;
  ipWhitelist: string[];
}

export interface ApiKeyDto {
  id: string;
  name: string;
  key?: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string | null;
  isActive: boolean;
}

export interface DbStatsDto {
  totalSizeMb: number;
  totalArticles: number;
  totalUsers: number;
  lastBackupAt?: string | null;
  status: "healthy" | "degraded" | "down";
}

export type RoleDto = { id: string; key: string; name: string };

export type PermissionDto = {
  id: string;
  key: string;
  label: string;
  group?: string | null;
};

export type WorkflowStatus = "draft" | "in_review" | "rejected" | "published" | "archived";

export type ReviewRejectDto = { comment?: string | null };

export type ArticleEditorForm = {
  title: string;
  excerpt: string;
  contentHtml: string;
  categoryId: string;
  tags: string;
  status: ArticleStatus;
};

export type AnyArticle = { id: string | number };

export type GuardRule = { path: string; permissions?: string[]; roles?: string[] };

export type MenuItem = {
  name: string;
  path: string;
  icon: any;
  danger?: boolean;
  roles?: string[];
  permissions?: string[];
};

export type NewsletterTableMode = "all" | "unverified";

export type AuthUser = {
  role?: string;
  roles?: string[];
  permissions?: string[];
};

export type AccessRule = {
  role?: string;
  roles?: string[];
  permissions?: string[];
  permissionsMode?: "all" | "any";
};

export type DisplayAuthor = { id: string; name: string; avatar?: string | null; isMain: boolean };

export type UiPost = {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string | null;
  publishedAt?: string | null;
  slug?: string | null;
  categoryLabel?: string | null;
  views?: number | null;
};

export type TocItem = { id: string; text: string; level: 2 | 3 };

export interface PrivateLayoutProps {
  children: ReactNode;
}

export type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  image: string;
  color: string;
  sortOrder: number;
};

export type EditFormState = {
  name: string;
  username: string;
  bio: string;
  phone: string;
  location: string;
  website: string;
  company: string;
};

export type ArticleProps = {
  isOpen: boolean;
  onClose: () => void;

  loadingArticle?: boolean;
  saving?: boolean;

  articleId: string | null;

  form: ArticleEditorForm;
  setForm: (v: ArticleEditorForm) => void;

  categories: CategoryDto[];
  allowedStatuses?: ArticleStatus[];

  rightMetaSlot?: ReactNode;

  onSave: () => void;
  onPreview?: () => void;
};

export type AppTableProps = {
  children: ReactNode;
  size?: TableProps["size"];
  variant?: TableProps["variant"];
  stickyHeader?: boolean;
};

export type Mode = "articles" | "reviewQueue";

export type ArticleTableProps = {
  mode: Mode;
  rows: ArticleDto[];
  categories?: CategoryDto[];
  busyId?: string | null;
  canAct?: (
    a: ArticleDto,
    action: "preview" | "edit" | "publish" | "unpublish" | "delete" | "approve" | "reject"
  ) => boolean;

  onPreview?: (a: ArticleDto) => void;
  onEdit?: (a: ArticleDto) => void;

  onPublish?: (a: ArticleDto) => void;
  onUnpublish?: (a: ArticleDto) => void;
  onDelete?: (a: ArticleDto) => void;

  onApprove?: (a: ArticleDto) => void;
  onReject?: (a: ArticleDto) => void;

  showInlineApproveButton?: boolean;
};

export type ContactTableMode = "all" | "unread";

export type ContactRow = {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  isRead: boolean;
  archivedAt?: string | null;
  createdAt?: string;
};

export type ContactTableProps = {
  mode: ContactTableMode;
  rows: ContactRow[];
  busyId?: string | null;

  onMarkRead?: (row: ContactRow) => void;
  onMarkUnread?: (row: ContactRow) => void;
  onDelete?: (row: ContactRow) => void;
};

export type FilterBarProps = {
  left: ReactNode;
  right?: ReactNode;
  mb?: number;
};

export type NewsletterRow = {
  id: string;
  email: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt?: string | null;
};

export type NewsletterProps = {
  mode: NewsletterTableMode;
  rows: NewsletterRow[];
  busyId?: string | null;

  onDelete?: (row: NewsletterRow) => void;
  onToggleActive?: (row: NewsletterRow, value: boolean) => void;
  onToggleVerified?: (row: NewsletterRow, value: boolean) => void;
};

export type MeDto = {
  userId: string;
  username: string;
  email: string;
  role: string;
  roles: string[];
  permissions: string[];
  name?: string;
  avatar?: string | null;
};

export type AuthContextType = {
  user: MeDto | null;
  isLoading: boolean;

  login: (credentials: { email: string; password: string }) => Promise<MeDto>;
  logout: () => void;

  register: (data: RegisterData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  refreshAccessToken: () => Promise<string>;
  refreshUser: () => Promise<void>;
};

export type AuthProviderProps = {
  children: ReactNode;
  onLoginSuccess: () => void;
  onLogout: () => void;
};

export type PrivateRouteProps = {
  children: ReactNode;
};

export interface AuthLayoutProps {
  children: ReactNode;
}

export interface PublicLayoutProps {
  children: ReactNode;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export type NavLinkProps = {
  to: string;
  children: ReactNode;
  isActive: boolean;
  onClick?: () => void;
};

export type CacheConsentProps = {
  isOpen: boolean;
  onClose: () => void;
  onAccepted?: () => void;
  onRejected?: () => void;
};

export type CacheConsent = {
  version: string;
  choice: "accepted" | "rejected";
  createdAt: string;
};

export type Link = { userId: string; isMain: boolean; user: UserMiniDto };

export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type UserMini = {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
};

export type CommentDto = {
  id: string;
  articleId: string;
  userId: string | null;
  content: string;
  createdAt?: string;
  isHidden?: boolean;
  user?: UserMini | null;
  status?: CommentStatus;
  updatedAt?: string;
  guestName?: string | null;
  guestEmail?: string | null;
};

export type SelectedAuthorRowProps = {
  u: UserMiniDto;
  idx: number;
  onMakeMain: (id: string) => void;
  onRemove: (id: string) => void;
};

export type Badges = {
  reviewArticles: number;
  reviewCategories: number;
  reviewAds: number;
  reviewUsers: number;
  unreadMessages: number;
};
