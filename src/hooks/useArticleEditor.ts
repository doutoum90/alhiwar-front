import { useCallback, useState } from "react";
import { articleService } from "../services/articleService";
import type { ArticleDto, ArticleEditorForm, ArticleStatus } from "../types";

const getCategoryId = (category: unknown): string => {
    if (!category) return "";
    if (typeof category === "string") return category;
    if (typeof category === "object") return (category as any)?.id ?? "";
    return "";
};

const stripHtmlToText = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return (div.textContent || div.innerText || "").trim();
};

export function useArticleEditor() {
    const [selectedArticle, setSelectedArticle] = useState<ArticleDto | null>(null);
    const [articleId, setArticleId] = useState<string | null>(null);

    const [loadingArticle, setLoadingArticle] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState<ArticleEditorForm>({
        title: "",
        excerpt: "",
        contentHtml: "<p></p>",
        categoryId: "",
        tags: "",
        status: "draft",
    });

    const resetToCreate = useCallback(() => {
        setSelectedArticle(null);
        setArticleId(null);
        setForm({
            title: "",
            excerpt: "",
            contentHtml: "<p></p>",
            categoryId: "",
            tags: "",
            status: "draft",
        });
    }, []);

    const openCreate = useCallback(() => {
        resetToCreate();
    }, [resetToCreate]);

    const openEdit = useCallback(async (articleOrId: ArticleDto | string) => {
        const id = typeof articleOrId === "string" ? articleOrId : articleOrId.id;

        setLoadingArticle(true);
        try {
            const fresh = await articleService.getOne(id);
            setSelectedArticle(fresh as any);
            setArticleId(fresh.id);

            setForm({
                title: fresh.title || "",
                excerpt: (fresh as any).excerpt || "",
                contentHtml: (fresh as any).content || "<p></p>",
                categoryId: getCategoryId((fresh as any).category) || (fresh as any).categoryId || "",
                tags: ((fresh as any).tags || []).join(", "),
                status: ((fresh as any).status as ArticleStatus) || "draft",
            });
        } finally {
            setLoadingArticle(false);
        }
    }, []);

    const validate = useCallback(() => {
        const title = form.title.trim();
        const excerpt = form.excerpt.trim();
        const contentText = stripHtmlToText(form.contentHtml || "<p></p>");
        if (!title || !excerpt || !contentText) {
            return { ok: false as const, message: "Titre, extrait et contenu sont obligatoires." };
        }
        return { ok: true as const, message: "" };
    }, [form]);

    const save = useCallback(async () => {
        const v = validate();
        if (!v.ok) throw new Error(v.message);

        const payload: any = {
            title: form.title.trim(),
            excerpt: form.excerpt.trim(),
            content: form.contentHtml || "<p></p>",
            categoryId: form.categoryId || undefined,
            status: form.status,
            tags: form.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
        };

        setSaving(true);
        try {
            if (!articleId) {
                const created = await articleService.createArticle(payload);
                setSelectedArticle(created as any);
                setArticleId((created as any).id);

                setForm((prev) => ({
                    ...prev,
                    title: (created as any).title ?? prev.title,
                    excerpt: (created as any).excerpt ?? prev.excerpt,
                    contentHtml: (created as any).content ?? prev.contentHtml,
                    categoryId: getCategoryId((created as any).category) || (created as any).categoryId || prev.categoryId,
                    tags: (((created as any).tags || []) as string[]).join(", ") || prev.tags,
                    status: ((created as any).status as ArticleStatus) || prev.status,
                }));

                return { mode: "created" as const, article: created as any };
            } else {
                const updated = await articleService.updateArticle(articleId, payload);
                setSelectedArticle(updated as any);
                return { mode: "updated" as const, article: updated as any };
            }
        } finally {
            setSaving(false);
        }
    }, [articleId, form, validate]);

    return {
        selectedArticle,
        articleId,
        loadingArticle,
        saving,
        form,
        setForm,

        resetToCreate,
        openCreate,
        openEdit,
        save,
    };
}
