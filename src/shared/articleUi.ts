
import type { ArticleStatus } from "../services/articleService";
import type { CategoryDto } from "../services/categoryService";

export const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR");
};

export const getCategoryId = (category: unknown): string => {
  if (!category) return "";
  if (typeof category === "string") return category;
  if (typeof category === "object") return (category as any)?.id ?? "";
  return "";
};

export const getCategoryLabel = (category: unknown): string => {
  if (!category) return "";
  if (typeof category === "string") return category;
  if (typeof category === "object") return (category as any)?.name ?? (category as any)?.slug ?? "";
  return "";
};

export const makeCategoryMap = (categories: CategoryDto[]) => {
  const m = new Map<string, string>();
  categories.forEach((c) => m.set(c.id, c.name));
  return m;
};

export const resolveCategoryLabel = (article: any, categoryMap?: Map<string, string>) => {
  const label = getCategoryLabel(article?.category);
  if (label) return label;

  const cid = getCategoryId(article?.category) || String(article?.categoryId ?? "");
  if (!cid) return "—";
  return categoryMap?.get(cid) || "—";
};


export type DisplayAuthor = { id: string; name: string; avatar?: string | null; isMain: boolean };

export const getDisplayAuthorsFromArticle = (a: any): DisplayAuthor[] => {
  const links = a?.authors;

  if (Array.isArray(links) && links.length > 0) {
    return links
      .slice()
      .sort((x: any, y: any) => Number(Boolean(y?.isMain)) - Number(Boolean(x?.isMain)))
      .map((l: any) => {
        const u = l?.user ?? {};
        const id = String(u?.id ?? l?.userId ?? "");
        if (!id) return null;

        return {
          id,
          name: String(u?.name ?? u?.username ?? "Auteur"),
          avatar: u?.avatar ?? null,
          isMain: Boolean(l?.isMain),
        } as DisplayAuthor;
      })
      .filter(Boolean) as DisplayAuthor[];
  }

  if (a?.author?.id) {
    return [
      {
        id: String(a.author.id),
        name: String(a.author.name ?? a.author.username ?? "Auteur"),
        avatar: a.author.avatar ?? null,
        isMain: true,
      },
    ];
  }

  return [];
};


export const getStatusColor = (status: ArticleStatus) => {
  switch (status) {
    case "published":
      return "green";
    case "draft":
      return "yellow";
    case "archived":
      return "gray";
    case "in_review":
      return "blue";
    case "rejected":
      return "red";
    default:
      return "gray";
  }
};

export const getStatusText = (status: ArticleStatus) => {
  switch (status) {
    case "published":
      return "Publié";
    case "draft":
      return "Brouillon";
    case "archived":
      return "Archivé";
    case "in_review":
      return "En review";
    case "rejected":
      return "Rejeté";
    default:
      return status;
  }
};
