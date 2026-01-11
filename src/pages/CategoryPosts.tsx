import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

import { articleService, type ArticleDto } from "../services/articleService";
import { adsService, type AdDto } from "../services/adsService";
import { categoryService, type CategoryDto } from "../services/categoryService";
import { useArticleThumbs } from "../hooks/useArticleThumbs";
import { AdCard, RubriqueSection, type UiPost, safeTime } from "../shared/article/publicUi";

const toUiPost = (a: any, imageUrl: string | null): UiPost => ({
  id: String(a.id),
  title: String(a.title ?? ""),
  summary: String(a.excerpt ?? a.summary ?? ""),
  imageUrl,
  publishedAt: a.publishedAt ?? a.createdAt ?? null,
  slug: a.slug ?? null,
  categoryLabel: a?.category?.name ?? a?.categoryName ?? null,
  views: a.views ?? null,
});

export default function CategoryPosts() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const openArticle = useCallback(
    (slugOrId: string) => navigate(`/posts/${encodeURIComponent(slugOrId)}`),
    [navigate]
  );

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const [cat, setCat] = useState<CategoryDto | null>(null);
  const [items, setItems] = useState<ArticleDto[]>([]);
  const [ads, setAds] = useState<AdDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cats = await categoryService.getPublished().catch(() => [] as CategoryDto[]);
      const found = (cats ?? []).find((c: any) => String(c.slug ?? "") === String(slug ?? ""));
      setCat(found ?? null);

      const pub = await articleService.getPublished().catch(() => [] as ArticleDto[]);
      const filtered = (pub ?? []).filter((a: any) => String(a?.category?.slug ?? a?.categorySlug ?? "") === String(slug ?? ""));
      setItems(filtered);

      const pubAds = await adsService.getPublished().catch(() => [] as AdDto[]);
      setAds(Array.isArray(pubAds) ? pubAds.filter(Boolean) : []);
    } catch (e: any) {
      setError(e?.message || "Impossible de charger la rubrique.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const thumbs = useArticleThumbs(
    items as any[],
    items.map((a: any) => a.id).join(","),
    (id: string) => articleService.listMedia(id)
  );

  const ui = useMemo(() => {
    const mapped = items.map((a: any) => toUiPost(a, thumbs[String(a.id)] ?? null));
    mapped.sort((a, b) => safeTime(b.publishedAt) - safeTime(a.publishedAt));
    return mapped;
  }, [items, thumbs]);

  const bannerAds = useMemo(() => ads.filter((a) => String(a.type ?? "").toLowerCase() === "banner"), [ads]);
  const inlineAds = useMemo(() => ads.filter((a) => String(a.type ?? "").toLowerCase() === "inline"), [ads]);

  if (loading) {
    return (
      <VStack mt={12}>
        <Spinner size="xl" />
        <Text color="gray.500">Chargement...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error" mt={10} maxW="xl" mx="auto" borderRadius="lg">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Erreur</Text>
          <Text>{error}</Text>
          <Button mt={3} size="sm" onClick={load}>
            Réessayer
          </Button>
        </Box>
      </Alert>
    );
  }

  return (
    <Box bg={pageBg} minH="calc(100vh - 120px)">
      <Box maxW="7xl" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }}>
        <HStack justify="space-between" mb={6} align="baseline">
          <Heading size="lg">{cat?.name ?? slug ?? "Rubrique"}</Heading>
          <Badge colorScheme="teal" variant="subtle">
            {ui.length} article(s)
          </Badge>
        </HStack>

        {bannerAds[0] ? (
          <Box mb={6}>
            <AdCard ad={bannerAds[0]} variant="banner" />
          </Box>
        ) : null}

        {ui.length === 0 ? (
          <Text color="gray.500">Aucun article dans cette rubrique.</Text>
        ) : (
          <>
            <RubriqueSection title="Articles" posts={ui.slice(0, 12)} onOpen={openArticle} />
            {inlineAds[0] ? (
              <>
                <Divider my={8} />
                <AdCard ad={inlineAds[0]} variant="inline" />
              </>
            ) : null}
          </>
        )}
      </Box>
    </Box>
  );
}
