import { useEffect, useState } from "react";
import { articleService } from "../services/articleService";
import { categoryService } from "../services/categoryService";
import { adsService } from "../services/adsService";
import { apiFetch } from "../services/api";
import type { Badges } from "../types";
import { safeCount } from "../utils/utils";


export function useAdminBadges(pollMs = 0) {
  const [badges, setBadges] = useState<Badges>({
    reviewArticles: 0,
    reviewCategories: 0,
    reviewAds: 0,
    reviewUsers: 0,
    unreadMessages: 0,
  });

  const load = async () => {
    const [reviewArticles, reviewCategories, reviewAds, reviewUsers, unreadMessages] =
      await Promise.all([
        safeCount(articleService.getReviewQueue()),
        safeCount(categoryService.getReviewQueue()),
        safeCount(adsService.getReviewQueue()),
        safeCount(apiFetch("/api/users/admin/review-queue")),
        (async () => {
          try {
            const r = await apiFetch("/api/contact/stats/unread-count");
            return Number(r?.count ?? 0);
          } catch (e: any) {
            if (e?.status === 403) return 0;
            return 0;
          }
        })(),
      ]);

    setBadges({ reviewArticles, reviewCategories, reviewAds, reviewUsers, unreadMessages });
  };

  useEffect(() => {
    load();
    if (!pollMs) return;
    const id = window.setInterval(load, pollMs);
    return () => window.clearInterval(id);
  }, [pollMs]);

  return badges;
}
