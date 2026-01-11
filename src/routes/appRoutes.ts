import type { GuardRule } from "../types";

export const PRIVATE_ROUTE_RULES: GuardRule[] = [
    { path: "/espace-membre/dashboard", permissions: ["stats.dashboard.view"] },
    { path: "/espace-membre/articles", permissions: ["articles.view"] },
    { path: "/espace-membre/categories", permissions: ["categories.view"] },
    { path: "/espace-membre/users", permissions: ["users.view"] },
    { path: "/espace-membre/ads", permissions: ["ads.view"] },
    { path: "/espace-membre/newsletter", permissions: ["newsletter.view"] },
    { path: "/espace-membre/messages", permissions: ["contacts.view"] },

    
    { path: "/espace-membre/rbac/roles", permissions: ["rbac.roles.view"] },
];
