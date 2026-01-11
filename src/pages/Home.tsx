import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

import { articleService } from "../services/articleService";
import { adsService } from "../services/adsService";
import { categoryService } from "../services/categoryService";
import type { AdDto, ArticleDto, CategoryDto } from "../types";

import { useArticleThumbs } from "../hooks/useArticleThumbs";
import {
  AdCard,
  ArchiveMiniCard,
  HeroCard,
  RubriqueSection,
  safeTime,
} from "../shared/article/publicUi";
import type { UiPost } from "../types";
import { normalize } from "../utils/utils";

const groupBy = <T, K extends string>(items: T[], keyFn: (i: T) => K) => {
  const map = new Map<K, T[]>();
  for (const it of items) {
    const k = keyFn(it);
    map.set(k, [...(map.get(k) ?? []), it]);
  }
  return map;
};

const getCategoryLabel = (a: any): string | null => a?.category?.name ?? a?.categoryName ?? null;

const toUiPost = (a: any, imageUrl: string | null): UiPost => ({
  id: String(a.id),
  title: String(a.title ?? ""),
  summary: String(a.excerpt ?? a.summary ?? ""),
  imageUrl,
  publishedAt: a.publishedAt ?? a.createdAt ?? null,
  slug: a.slug ?? null,
  categoryLabel: getCategoryLabel(a),
  views: a.views ?? null,
});

export default function Home() {
  const [publishedArticles, setPublishedArticles] = useState<ArticleDto[]>([]);
  const [archivedArticles, setArchivedArticles] = useState<ArticleDto[]>([]);
  const [ads, setAds] = useState<AdDto[]>([]);
  const [publishedCats, setPublishedCats] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const openArticle = useCallback(
    (slugOrId: string) => navigate(`/posts/${encodeURIComponent(slugOrId)}`),
    [navigate]
  );

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const sectionDivider = useColorModeValue("gray.200", "gray.700");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [catsPub, pub, arch, pubAds] = await Promise.all([
        categoryService.getPublished().catch(() => [] as CategoryDto[]),
        articleService.getPublished().catch(() => [] as ArticleDto[]),
        articleService.getArchived().catch(() => [] as ArticleDto[]),
        adsService.getPublished().catch(() => [] as AdDto[]),
      ]);

      const cats = Array.isArray(catsPub) ? catsPub.filter(Boolean) : [];
      setPublishedCats(cats);

      const catIdSet = new Set(cats.map((c) => String(c.id)));
      const catSlugSet = new Set(cats.map((c) => normalize(String(c.slug ?? ""))));
      const catNameSet = new Set(cats.map((c) => normalize(String(c.name ?? ""))));

      const isCatPublishedForArticle = (a: any) => {
        const cid = String(a?.categoryId ?? a?.category?.id ?? "");
        if (cid && catIdSet.has(cid)) return true;

        const slug = normalize(String(a?.category?.slug ?? a?.categorySlug ?? ""));
        if (slug && catSlugSet.has(slug)) return true;

        const name = normalize(String(a?.category?.name ?? a?.categoryName ?? ""));
        if (name && catNameSet.has(name)) return true;

        return false;
      };

      setPublishedArticles((pub ?? []).filter(isCatPublishedForArticle));
      setArchivedArticles((arch ?? []).filter(isCatPublishedForArticle));
      setAds(Array.isArray(pubAds) ? pubAds.filter(Boolean) : []);
    } catch (e: any) {
      setError(e?.message || "Impossible de charger les articles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const thumbs = useArticleThumbs(
    [...publishedArticles, ...archivedArticles] as any[],
    `${publishedArticles.map((a: any) => a.id).join(",")}|${archivedArticles.map((a: any) => a.id).join(",")}`,
    (id: string) => articleService.listMedia(id)
  );

  const publishedUi = useMemo(() => {
    const mapped = publishedArticles.map((a: any) => toUiPost(a, thumbs[String(a.id)] ?? null));
    mapped.sort((a, b) => safeTime(b.publishedAt) - safeTime(a.publishedAt));
    return mapped;
  }, [publishedArticles, thumbs]);

  const archivedUi = useMemo(() => {
    const mapped = archivedArticles.map((a: any) => toUiPost(a, thumbs[String(a.id)] ?? null));
    mapped.sort((a, b) => safeTime(b.publishedAt) - safeTime(a.publishedAt));
    return mapped;
  }, [archivedArticles, thumbs]);

  const hero = publishedUi[0] ?? null;
  const rest = hero ? publishedUi.slice(1) : publishedUi;

  const byRubrique = useMemo(() => {
    const map = groupBy(rest, (p) => (p.categoryLabel?.trim() || "Autres") as string);
    const entries = [...map.entries()].map(([k, v]) => {
      const newest = Math.max(...v.map((x) => safeTime(x.publishedAt)));
      return { key: k, posts: v, newest };
    });
    entries.sort((a, b) => b.newest - a.newest);
    return entries;
  }, [rest]);

  const bannerAds = useMemo(
    () => ads.filter((a) => a && String(a.type ?? "").toLowerCase() === "banner"),
    [ads]
  );
  const sidebarAds = useMemo(
    () => ads.filter((a) => a && String(a.type ?? "").toLowerCase() === "sidebar"),
    [ads]
  );
  const inlineAds = useMemo(
    () => ads.filter((a) => a && String(a.type ?? "").toLowerCase() === "inline"),
    [ads]
  );

  if (loading) {
    return (
      <VStack mt={12}>
        <Spinner size="xl" />
        <Text color="gray.500">Chargement des articles...</Text>
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
        <VStack spacing={2} mb={8}>
          <Heading as="h1" size="xl" textAlign="center">
            Journal Alhiwar
          </Heading>
          <Text color="gray.600" textAlign="center" maxW="2xl">
            Actualités et analyses, classées par rubriques — suivez l’essentiel, sans bruit.
          </Text>
          {publishedCats.length > 0 ? (
            <Badge variant="subtle" colorScheme="teal">
              {publishedCats.length} rubrique(s) publiée(s)
            </Badge>
          ) : null}
        </VStack>

        {bannerAds[0] ? (
          <Box mb={6}>
            <AdCard ad={bannerAds[0]} variant="banner" />
          </Box>
        ) : null}

        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={8} mb={10}>
          <Box gridColumn={{ base: "1 / -1", lg: "1 / span 8" }}>
            {hero ? (
              <HeroCard post={hero} onOpen={openArticle} />
            ) : (
              <Card bg={cardBg} borderRadius="2xl" shadow="sm">
                <CardBody>
                  <Heading size="md">Aucun article publié</Heading>
                  <Text mt={2} color="gray.600">
                    Publiez un premier article pour alimenter la page d’accueil.
                  </Text>
                </CardBody>
              </Card>
            )}
          </Box>

          <Box gridColumn={{ base: "1 / -1", lg: "9 / span 4" }}>
            {sidebarAds[0] ? (
              <AdCard ad={sidebarAds[0]} variant="sidebar" />
            ) : (
              <Card bg={cardBg} borderRadius="2xl" shadow="sm">
                <CardBody>
                  <Heading size="sm" mb={2}>
                    À découvrir
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    Espace publicitaire (sidebar).
                  </Text>
                </CardBody>
              </Card>
            )}
          </Box>
        </SimpleGrid>

        {byRubrique.length === 0 ? (
          <Text textAlign="center" color="gray.500">
            Aucun article publié pour le moment.
          </Text>
        ) : (
          <VStack align="stretch" spacing={10}>
            {byRubrique.map((section, idx) => (
              <Box key={section.key}>
                <RubriqueSection
                  title={section.key}
                  posts={section.posts.slice(0, 6)}
                  onOpen={openArticle}
                  rightSlot={
                    <Badge colorScheme="teal" variant="subtle">
                      {section.posts.length} article(s)
                    </Badge>
                  }
                />

                {inlineAds.length > 0 && (idx + 1) % 2 === 0 ? (
                  <Box mt={6}>
                    <AdCard ad={inlineAds[Math.floor(idx / 2) % inlineAds.length]} variant="inline" />
                  </Box>
                ) : null}

                <Divider mt={8} borderColor={sectionDivider} />
              </Box>
            ))}
          </VStack>
        )}

        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={8} mt={10}>
          <Box gridColumn={{ base: "1 / -1", lg: "1 / span 8" }}>
            <HStack justify="space-between" mb={3} align="baseline">
              <Heading size="md">Archives</Heading>
              <Badge variant="subtle" colorScheme="gray">
                {archivedUi.length}
              </Badge>
            </HStack>

            {archivedUi.length === 0 ? (
              <Text color="gray.500">Aucun article archivé.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {archivedUi.slice(0, 10).map((p) => (
                  <ArchiveMiniCard key={p.id} a={p} onOpen={openArticle} />
                ))}
              </SimpleGrid>
            )}
          </Box>

          <Box gridColumn={{ base: "1 / -1", lg: "9 / span 4" }}>
            {sidebarAds[1] ? (
              <AdCard ad={sidebarAds[1]} variant="sidebar" />
            ) : (
              <Card bg={cardBg} borderRadius="2xl" shadow="sm">
                <CardBody>
                  <Heading size="sm" mb={2}>
                    Espace sponsorisé
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    Deuxième emplacement publicitaire (bas droite).
                  </Text>
                </CardBody>
              </Card>
            )}
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
