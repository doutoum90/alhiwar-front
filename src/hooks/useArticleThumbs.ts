import { useEffect, useState } from "react";
import type { ArticleMediaDto } from "../services/articleService";

type AnyArticle = { id: string | number };

const pickFirstImageFromMedia = (media: ArticleMediaDto[] | undefined | null) => {
  const imgs = (media ?? []).filter((m) => String((m as any)?.type ?? "").toLowerCase() === "image");
  imgs.sort((a: any, b: any) => Number(a?.position ?? 0) - Number(b?.position ?? 0));
  return imgs[0]?.url ?? null;
};

export function useArticleThumbs<T extends AnyArticle>(
  articles: T[],
  depsKey: string,
  listMedia: (id: string) => Promise<ArticleMediaDto[]>
) {
  const [thumbs, setThumbs] = useState<Record<string, string | null>>({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!articles?.length) return;

      const pairs = await Promise.allSettled(
        articles.map(async (a: any) => {
          const media = await listMedia(String(a.id)).catch(() => [] as ArticleMediaDto[]);
          const url = pickFirstImageFromMedia(media);
          return [String(a.id), url] as const;
        })
      );

      if (cancelled) return;

      const next: Record<string, string | null> = {};
      for (const r of pairs) {
        if (r.status === "fulfilled") {
          const [id, url] = r.value;
          next[id] = url;
        }
      }

      setThumbs(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [depsKey]);

  return thumbs;
}
