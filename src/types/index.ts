import type { ReactNode } from "react";
import type { ArticleEditorForm } from "../hooks/useArticleEditor";
import type { CategoryDto } from "../services/categoryService";
import type { TableProps } from "@chakra-ui/react";
import type { ArticleDto, UserMiniDto } from "../services/articleService";
import type { NewsletterTableMode } from "../constantes";

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

    rightMetaSlot?: React.ReactNode;

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

    onPreview?: (a: ArticleDto) => void; // ✅ optionnel
    onEdit?: (a: ArticleDto) => void; // ✅ optionnel

    // ArticleDashboard
    onPublish?: (a: ArticleDto) => void;
    onUnpublish?: (a: ArticleDto) => void;
    onDelete?: (a: ArticleDto) => void;

    // ReviewQueueDashboard
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

export interface PrivateLayoutProps {
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
    children: React.ReactNode;
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
    createdAt: string; // ISO
};

export type Link = { userId: string; isMain: boolean; user: UserMiniDto };

export type Paged<T> = {
    items: T[];
    total: number;
    page: number;
    limit: number;
    pages?: number;
};

export type CommentStatus = "visible" | "pending" | "hidden";

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
}

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