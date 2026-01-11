import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Heading,
  HStack,
  Input,
  Spinner,
  Text,
  useColorModeValue,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  SimpleGrid,
} from "@chakra-ui/react";
import { FaPlus, FaRedo, FaSearch } from "react-icons/fa";
import ArticleTable from "../ui/ArticleTable";
import { articleService } from "../../services/articleService";
import { categoryService } from "../../services/categoryService";
import type { ArticleDto, ArticleStatus, CategoryDto } from "../../types";
import { useArticleEditor } from "../../hooks/useArticleEditor";
import ArticleEditModal from "./modal/ArticleEditModal";
import FilterBar from "../ui/FilterBar";
import { useResetPaginationOnChange } from "../../hooks/useResetPaginationOnChange";
import { useClampPagination } from "../../hooks/useClampPagination";
import { normalize } from "../../utils/utils";
import { PAGE_SIZE } from "../../constantes";
import { useAuth } from "../../contexts/AuthContext";

export default function ArticleDashboard() {
  const toast = useToast();

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const muted = useColorModeValue("gray.600", "gray.300");

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [articles, setArticles] = useState<ArticleDto[]>([]);
  const [reviewArticles, setReviewArticles] = useState<ArticleDto[]>([]);

  const [q, setQ] = useState("");

  const [filterStatus, setFilterStatus] = useState<
    "all" | "draft" | "in_review" | "published" | "rejected" | "archived"
  >("all");
  const [filterCategoryId, setFilterCategoryId] = useState<"all" | string>("all");

  const [pageAll, setPageAll] = useState(1);
  const [pageReview, setPageReview] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useAuth();
  const { articleId, loadingArticle, saving, form, setForm, openCreate, openEdit, save: saveEditor } =
    useArticleEditor();

  const userId = useMemo(() => (user?.userId ? String(user.userId) : ""), [user]);
  const isPrivileged = useMemo(() => {
    const role = normalize(user?.role ?? "");
    const roles = (user?.roles ?? []).map((r) => normalize(r));
    return role === "admin" || role === "editor" || roles.includes("admin") || roles.includes("editor");
  }, [user]);
  const isJournalist = useMemo(() => {
    const role = normalize(user?.role ?? "");
    const roles = (user?.roles ?? []).map((r) => normalize(r));
    return role === "journalist" || roles.includes("journalist");
  }, [user]);
  const canReview = isPrivileged;
  const canCreate = isPrivileged || isJournalist;

  useEffect(() => {
    if (canReview) return;
    if (filterStatus === "in_review") setFilterStatus("all");
  }, [canReview, filterStatus]);

  const openCreateModal = () => {
    openCreate();
    setIsModalOpen(true);
  };

  const openEditModal = async (a: ArticleDto) => {
    setIsModalOpen(true);
    try {
      await openEdit(a);
    } catch (e: any) {
      toast({
        status: "error",
        title: "Erreur",
        description: e?.message ?? "Impossible d’ouvrir l’article",
      });
      setIsModalOpen(false);
    }
  };

  const closeModal = () => setIsModalOpen(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, list, queue] = await Promise.all([
        categoryService.getCategories().catch(() => [] as CategoryDto[]),
        articleService.getArticles().catch(() => [] as ArticleDto[]),
        canReview ? articleService.getReviewQueue().catch(() => [] as ArticleDto[]) : Promise.resolve([] as ArticleDto[]),
      ]);
      const activeCats = (cats ?? []).filter((c: any) => String(c?.status ?? "published").toLowerCase() === "published");
      setCategories(activeCats);
      setArticles(Array.isArray(list) ? list : []);
      setReviewArticles(Array.isArray(queue) ? queue : []);
    } catch (e: any) {
      toast({
        title: "Chargement impossible",
        description: e?.message || "Erreur",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast, canReview]);

  useEffect(() => {
    loadAll();
  }, [loadAll, canReview]);

  const filterRows = useCallback(
    (rows: ArticleDto[]) => {
      const t = normalize(q);

      return rows.filter((a) => {
        const title = normalize(a.title);
        const excerpt = normalize(String(a.excerpt ?? ""));
        const status = String(a.status ?? "").toLowerCase() as any;
        const catName = normalize(String(a.category?.name ?? ""));
        const catId = String((a as any).category?.id ?? a.category?.id ?? "");

        const matchesSearch = !t || title.includes(t) || excerpt.includes(t) || status.includes(t) || catName.includes(t);

        const matchesStatus = filterStatus === "all" ? true : status === filterStatus;
        const matchesCategory = filterCategoryId === "all" ? true : catId === filterCategoryId;

        return matchesSearch && matchesStatus && matchesCategory;
      });
    },
    [q, filterStatus, filterCategoryId]
  );

  const isUserArticle = useCallback(
    (a: ArticleDto) => {
      if (!userId) return false;
      const authorId = String((a as any).authorId ?? (a as any).author?.id ?? "");
      if (authorId && authorId === userId) return true;

      const links = (a as any).authors;
      if (Array.isArray(links) && links.length > 0) {
        return links.some((l: any) => {
          const uid = String(l?.userId ?? l?.user?.id ?? "");
          return uid && uid === userId;
        });
      }

      return false;
    },
    [userId]
  );

  const canAct = useCallback(
    (a: ArticleDto, action: "preview" | "edit" | "publish" | "unpublish" | "delete" | "approve" | "reject") => {
      if (isPrivileged) return true;
      if (!isJournalist) return false;
      if (!isUserArticle(a)) return false;

      const status = String(a.status ?? "").toLowerCase();
      if (action === "preview") return true;
      if (action === "edit") return status === "draft" || status === "rejected";
      return false;
    },
    [isPrivileged, isJournalist, isUserArticle]
  );

  const allowedStatuses = useMemo<ArticleStatus[]>(() => {
    if (isPrivileged) return ["draft", "in_review", "published", "archived", "rejected"];
    if (isJournalist) return ["draft", "in_review", "rejected"];
    return ["draft"];
  }, [isPrivileged, isJournalist]);

  const filteredArticles = useMemo(() => {
    const base = filterRows(articles);
    if (canReview) return base;
    return base.filter((a) => String(a.status ?? "").toLowerCase() !== "in_review" && isUserArticle(a));
  }, [articles, filterRows, canReview, isUserArticle]);
  const filteredReview = useMemo(() => filterRows(reviewArticles), [reviewArticles, filterRows]);

  useResetPaginationOnChange([q, filterStatus, filterCategoryId], () => {
    setPageAll(1);
    setPageReview(1);
  });

  const pagesAll = useMemo(() => Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE)), [filteredArticles.length]);
  const pagesReview = useMemo(() => Math.max(1, Math.ceil(filteredReview.length / PAGE_SIZE)), [filteredReview.length]);

  useClampPagination(pagesAll, setPageAll);
  useClampPagination(pagesReview, setPageReview);

  const pagedArticles = useMemo(() => {
    const start = (pageAll - 1) * PAGE_SIZE;
    return filteredArticles.slice(start, start + PAGE_SIZE);
  }, [filteredArticles, pageAll]);

  const pagedReview = useMemo(() => {
    const start = (pageReview - 1) * PAGE_SIZE;
    return filteredReview.slice(start, start + PAGE_SIZE);
  }, [filteredReview, pageReview]);

  const statsAll = useMemo(() => {
    const total = filteredArticles.length;
    const published = filteredArticles.filter((a) => String(a.status).toLowerCase() === "published").length;
    const draft = filteredArticles.filter((a) => String(a.status).toLowerCase() === "draft").length;
    return { total, published, draft };
  }, [filteredArticles]);

  const statsReview = useMemo(() => {
    const total = reviewArticles.length;
    const inReview = reviewArticles.filter((a) => String(a.status).toLowerCase() === "in_review").length;
    return { total, inReview };
  }, [reviewArticles]);

  const toastOk = (title: string) => toast({ title, status: "success", duration: 2200, isClosable: true });
  const toastInfo = (title: string) => toast({ title, status: "info", duration: 2200, isClosable: true });
  const toastErr = (title: string, e: any) =>
    toast({ title, description: e?.message || "Erreur", status: "error", duration: 3500, isClosable: true });

  const withBusy = async (id: string, fn: () => Promise<void>) => {
    try {
      setBusyId(id);
      await fn();
    } catch (e) {
      toastErr("Action impossible", e);
    } finally {
      setBusyId(null);
    }
  };

  const onPreview = (a: ArticleDto) => {
    window.open(`/posts/${encodeURIComponent(a.slug)}?preview=1`, "_blank", "noreferrer");
  };

  const onEdit = (a: ArticleDto) => {
    if (!canAct(a, "edit")) return;
    void openEditModal(a);
  };

  const onPublish = (a: ArticleDto) =>
    withBusy(a.id, async () => {
      await articleService.publishArticle(a.id);
      toastOk("Article publié");
      await loadAll();
    });

  const onUnpublish = (a: ArticleDto) =>
    withBusy(a.id, async () => {
      await articleService.unpublishArticle(a.id);
      toastInfo("Article dépublié");
      await loadAll();
    });

  const onDelete = (a: ArticleDto) =>
    withBusy(a.id, async () => {
      if (!window.confirm("Supprimer cet article ?")) return;
      await articleService.deleteArticle(a.id);
      toastOk("Article supprimé");
      await loadAll();
    });

  const onApprove = (a: ArticleDto) =>
    withBusy(a.id, async () => {
      await articleService.approveArticle(a.id);
      toastOk("Article approuvé");
      await loadAll();
    });

  const onReject = (a: ArticleDto) =>
    withBusy(a.id, async () => {
      const comment = window.prompt("Commentaire de rejet (optionnel) :") ?? "";
      await articleService.rejectArticle(a.id, comment);
      toastInfo("Article rejeté");
      await loadAll();
    });

  const onSaveModal = async () => {
    try {
      const res = await saveEditor();
      toastOk(res.mode === "created" ? "Article créé" : "Article mis à jour");
      await loadAll();
    } catch (e: any) {
      toast({ status: "error", title: "Erreur", description: e?.message ?? "Sauvegarde impossible" });
    }
  };

  return (
    <Box bg={pageBg} minH="calc(100vh - 120px)" p={{ base: 4, md: 6 }}>
      <Box maxW="7xl" mx="auto">
        <Card bg={cardBg} borderWidth="1px" borderColor={border} rounded="2xl">
          <CardBody>
            <Flex justify="space-between" align={{ base: "start", md: "center" }} wrap="wrap" gap={4}>
              <Box>
                <Heading size="lg">Article Dashboard</Heading>
                <Text mt={1} color={muted}>
                  Gestion des articles + file de review
                </Text>
              </Box>

              <HStack>
                <Button leftIcon={<FaRedo />} variant="outline" onClick={loadAll} isDisabled={loading}>
                  Rafraîchir
                </Button>
              </HStack>
            </Flex>

            <Divider my={5} />

            <FilterBar
              mb={5}
              left={
                <Box position="relative" w="full" maxW="520px">
                  <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" color="gray.400">
                    <FaSearch />
                  </Box>
                  <Input
                    pl="38px"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Rechercher (titre, extrait, statut, catégorie)…"
                  />
                </Box>
              }
              right={
                <SimpleGrid
                  columns={{ base: 2, md: 2 }}
                  spacing={3}
                  minW={{ base: "full", md: "auto" }}
                  w={{ base: "full", md: "auto" }}
                >
                  <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
                    <option value="all">Tous les statuts</option>
                    <option value="draft">Brouillon</option>
                    {canReview ? <option value="in_review">En revue</option> : null}
                    <option value="rejected">Rejeté</option>
                    <option value="published">Publié</option>
                    <option value="archived">Archivé</option>
                  </Select>

                  <Select value={filterCategoryId} onChange={(e) => setFilterCategoryId(e.target.value)}>
                    <option value="all">Toutes les catégories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </SimpleGrid>
              }
            />

            <Tabs isFitted variant="enclosed" colorScheme="teal">
              <TabList mb="1em">
                <Tab>Toutes</Tab>
                {canReview ? (
                  <Tab>
                    En revue{" "}
                    {reviewArticles.length > 0 ? (
                      <Badge ml={2} colorScheme="blue" borderRadius="full">
                        {reviewArticles.length}
                      </Badge>
                    ) : null}
                  </Tab>
                ) : null}
              </TabList>

              <TabPanels>
                <TabPanel p={0}>
                  <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
                    <HStack spacing={2} wrap="wrap">
                      <Badge variant="subtle" colorScheme="gray">
                        Total: {statsAll.total}
                      </Badge>
                      <Badge variant="subtle" colorScheme="green">
                        Publiés: {statsAll.published}
                      </Badge>
                      <Badge variant="subtle" colorScheme="yellow">
                        Brouillons: {statsAll.draft}
                      </Badge>
                    </HStack>

                    <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={openCreateModal} isDisabled={loading || !canCreate}>
                      Nouvel article
                    </Button>
                  </Flex>

                  {loading ? (
                    <Flex py={10} justify="center">
                      <Spinner />
                    </Flex>
                  ) : (
                    <>
                      <Box overflowX="auto">
                        <ArticleTable
                          mode="articles"
                          rows={pagedArticles}
                          categories={categories}
                          busyId={busyId}
                          canAct={canAct}
                          onPreview={onPreview}
                          onEdit={onEdit}
                          onPublish={onPublish}
                          onUnpublish={onUnpublish}
                          onDelete={onDelete}
                          showInlineApproveButton={true}
                        />
                      </Box>

                      <Divider my={5} />
                      <Flex justify="space-between" align="center" color={muted} fontSize="sm" wrap="wrap" gap={3}>
                        <Text>
                          Page : {pageAll} / {pagesAll} • Total : {filteredArticles.length}
                        </Text>
                        <HStack>
                          <Button size="sm" onClick={() => setPageAll((p) => Math.max(1, p - 1))} isDisabled={pageAll <= 1}>
                            Précédent
                          </Button>
                          <Button size="sm" onClick={() => setPageAll((p) => Math.min(pagesAll, p + 1))} isDisabled={pageAll >= pagesAll}>
                            Suivant
                          </Button>
                        </HStack>
                      </Flex>
                    </>
                  )}
                </TabPanel>

                {canReview ? (
                  <TabPanel p={0}>
                  <HStack spacing={2} wrap="wrap" mb={4}>
                    <Badge variant="subtle" colorScheme="gray">
                      Total: {statsReview.total}
                    </Badge>
                    <Badge variant="subtle" colorScheme="blue">
                      En review: {statsReview.inReview}
                    </Badge>
                  </HStack>

                  {loading ? (
                    <Flex py={10} justify="center">
                      <Spinner />
                    </Flex>
                  ) : (
                    <>
                      <Box overflowX="auto">
                        <ArticleTable
                          mode="reviewQueue"
                          rows={pagedReview}
                          categories={categories}
                          busyId={busyId}
                          canAct={canAct}
                          onPreview={onPreview}
                          onEdit={onEdit}
                          onApprove={onApprove}
                          onReject={onReject}
                          showInlineApproveButton={true}
                        />
                      </Box>

                      <Divider my={5} />
                      <Flex justify="space-between" align="center" color={muted} fontSize="sm" wrap="wrap" gap={3}>
                        <Text>
                          Page : {pageReview} / {pagesReview} • Total : {filteredReview.length}
                        </Text>
                        <HStack>
                          <Button size="sm" onClick={() => setPageReview((p) => Math.max(1, p - 1))} isDisabled={pageReview <= 1}>
                            Précédent
                          </Button>
                          <Button size="sm" onClick={() => setPageReview((p) => Math.min(pagesReview, p + 1))} isDisabled={pageReview >= pagesReview}>
                            Suivant
                          </Button>
                        </HStack>
                      </Flex>
                    </>
                  )}
                  </TabPanel>
                ) : null}
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </Box>

      <ArticleEditModal
        isOpen={isModalOpen}
        onClose={closeModal}
        loadingArticle={loadingArticle}
        saving={saving}
        articleId={articleId}
        form={form}
        setForm={setForm}
        categories={categories}
        allowedStatuses={allowedStatuses}
        onSave={onSaveModal}
      />
    </Box>
  );
}

