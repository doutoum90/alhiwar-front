import {
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  Container,
  Flex,
  InputGroup,
  InputLeftElement,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Card,
  CardBody,
  Spinner,
  FormHelperText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Select,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEllipsisV, FaRedo } from "react-icons/fa";
import { categoryService, type CategoryDto, type CategoryStatus } from "../../services/categoryService";
import FilterBar from "../ui/FilterBar";
import { useResetPaginationOnChange } from "../../hooks/useResetPaginationOnChange";
import { useClampPagination } from "../../hooks/useClampPagination";
import { normalize } from "../../utils/utils";
import type { CategoryForm } from "../../types";
import { PAGE_SIZE } from "../../constantes";

const CategoriesDashboard = () => {
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();
  const [rejectComment, setRejectComment] = useState("");

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [reviewCategories, setReviewCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | CategoryStatus | string>("all");

  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(null);

  const [pageAll, setPageAll] = useState(1);
  const [pageReview, setPageReview] = useState(1);

  const [formData, setFormData] = useState<CategoryForm>({
    name: "",
    slug: "",
    description: "",
    image: "",
    color: "",
    sortOrder: 0,
  });

  useResetPaginationOnChange([searchTerm, filterStatus], () => {
    setPageAll(1);
    setPageReview(1);
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [list, rq] = await Promise.all([
        categoryService.getCategories().catch(() => [] as CategoryDto[]),
        (categoryService as any).getReviewQueue?.().catch(() => [] as CategoryDto[]),
      ]);

      const all = Array.isArray(list) ? list : [];
      const review = Array.isArray(rq) ? rq : all.filter((c: any) => String(c.status).toLowerCase() === "in_review");

      setCategories(all);
      setReviewCategories(review);
    } catch (e: any) {
      if (e?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/auth/login";
        return;
      }
      toast({
        title: "Erreur chargement",
        description: e?.message || "Impossible de charger les catégories",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filterList = (list: CategoryDto[]) => {
    const t = searchTerm.trim().toLowerCase();

    return list.filter((c: any) => {
      const name = (c.name || "").toLowerCase();
      const slug = (c.slug || "").toLowerCase();
      const desc = (c.description || "").toLowerCase();
      const status = String(c.status ?? "").toLowerCase();

      const matchesSearch = !t || name.includes(t) || slug.includes(t) || desc.includes(t);
      const matchesStatus = filterStatus === "all" ? true : status === String(filterStatus).toLowerCase();

      return matchesSearch && matchesStatus;
    });
  };

  const filteredCategories = useMemo(() => filterList(categories), [categories, searchTerm, filterStatus]);
  const filteredReview = useMemo(() => filterList(reviewCategories), [reviewCategories, searchTerm, filterStatus]);

  const pagesAll = useMemo(() => Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE)), [filteredCategories.length]);
  const pagesReview = useMemo(() => Math.max(1, Math.ceil(filteredReview.length / PAGE_SIZE)), [filteredReview.length]);

  useClampPagination(pagesAll, setPageAll);
  useClampPagination(pagesReview, setPageReview);

  const pagedCategories = useMemo(() => {
    const start = (pageAll - 1) * PAGE_SIZE;
    return filteredCategories.slice(start, start + PAGE_SIZE);
  }, [filteredCategories, pageAll]);

  const pagedReviewCategories = useMemo(() => {
    const start = (pageReview - 1) * PAGE_SIZE;
    return filteredReview.slice(start, start + PAGE_SIZE);
  }, [filteredReview, pageReview]);

  const statusColor = (status: any) => {
    const s = String(status || "").toLowerCase();
    if (s === "published") return "green";
    if (s === "in_review") return "yellow";
    if (s === "rejected") return "red";
    if (s === "archived") return "gray";
    if (s === "draft") return "blue";
    return "purple";
  };

  const statusLabel = (status: any) => {
    const s = String(status || "").toLowerCase();
    if (s === "published") return "Publié";
    if (s === "in_review") return "En revue";
    if (s === "rejected") return "Rejeté";
    if (s === "archived") return "Archivé";
    if (s === "draft") return "Brouillon";
    return String(status || "—");
  };

  const openCreate = () => {
    setSelectedCategory(null);
    setFormData({ name: "", slug: "", description: "", image: "", color: "", sortOrder: 0 });
    onOpen();
  };

  const openEdit = (cat: any) => {
    setSelectedCategory(cat);
    setFormData({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      image: cat.image || "",
      color: cat.color || "",
      sortOrder: Number.isFinite(cat.sortOrder) ? cat.sortOrder : 0,
    });
    onOpen();
  };

  const confirmDelete = (cat: CategoryDto) => {
    setSelectedCategory(cat);
    onDeleteOpen();
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Champ requis",
        description: "Le nom de la catégorie est obligatoire.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const payload: any = {
      name: formData.name.trim(),
      slug: formData.slug ? normalize(formData.slug) : normalize(formData.name),
      description: formData.description?.trim() || null,
      image: formData.image?.trim() || null,
      color: formData.color?.trim() || null,
      sortOrder: Number.isFinite(formData.sortOrder) ? Number(formData.sortOrder) : 0,
    };

    setSaving(true);
    try {
      if (selectedCategory?.id) {
        await categoryService.updateCategory(selectedCategory.id as any, payload);
        toast({ title: "Catégorie mise à jour", status: "success", duration: 2500, isClosable: true });
      } else {
        await categoryService.createCategory(payload);
        toast({ title: "Catégorie créée", status: "success", duration: 2500, isClosable: true });
      }
      onClose();
      await loadAll();
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message || "Échec de l’enregistrement", status: "error", duration: 4000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory?.id) return;
    try {
      await categoryService.deleteCategory(selectedCategory.id as any);
      toast({ title: "Catégorie supprimée", status: "success", duration: 2500, isClosable: true });
      onDeleteClose();
      await loadAll();
    } catch (e: any) {
      toast({ title: "Erreur suppression", description: e?.message || "Impossible de supprimer", status: "error", duration: 4000, isClosable: true });
    }
  };

  const doWorkflow = async (fn: () => Promise<any>, okMsg: string) => {
    try {
      await fn();
      toast({ title: okMsg, status: "success", duration: 2500, isClosable: true });
      await loadAll();
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message || "Action impossible", status: "error", duration: 4000, isClosable: true });
    }
  };

  const submit = (cat: CategoryDto) => doWorkflow(() => categoryService.submitForReview(cat.id), "Soumise en revue");
  const approve = (cat: CategoryDto) => doWorkflow(() => categoryService.approveCategory(cat.id), "Catégorie publiée");
  const archive = (cat: CategoryDto) => doWorkflow(() => categoryService.archiveCategory(cat.id), "Catégorie archivée");

  const openReject = (cat: CategoryDto) => {
    setSelectedCategory(cat);
    setRejectComment("");
    onRejectOpen();
  };

  const confirmReject = async () => {
    if (!selectedCategory?.id) return;
    await doWorkflow(() => categoryService.rejectCategory(selectedCategory.id, rejectComment || ""), "Catégorie rejetée");
    onRejectClose();
  };

  const can = (status: CategoryStatus | null | undefined, action: "submit" | "approve" | "reject" | "archive") => {
    const s = String(status || "").toLowerCase();
    if (action === "submit") return s === "draft" || s === "rejected";
    if (action === "approve") return s === "in_review";
    if (action === "reject") return s === "in_review";
    if (action === "archive") return s === "published";
    return false;
  };

  const renderTable = (
    rows: CategoryDto[],
    emptyText: string,
    pagination: { page: number; pages: number; total: number; onPrev: () => void; onNext: () => void }
  ) => (
    <Card>
      <CardBody p={0}>
        {loading ? (
          <Flex py={10} justify="center">
            <Spinner size="lg" />
          </Flex>
        ) : (
          <>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Nom</Th>
                  <Th>Slug</Th>
                  <Th>Description</Th>
                  <Th>Statut</Th>
                  <Th isNumeric>Ordre</Th>
                  <Th>Workflow</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((cat: any) => (
                  <Tr key={cat.id}>
                    <Td>
                      <VStack align="start" spacing={0.5}>
                        <Text fontWeight="semibold">{cat.name || "—"}</Text>
                        {cat.color ? (
                          <Text fontSize="xs" color="gray.500">
                            Couleur: {cat.color}
                          </Text>
                        ) : null}
                      </VStack>
                    </Td>

                    <Td>
                      <Text fontFamily="mono" fontSize="sm">
                        {cat.slug || "—"}
                      </Text>
                    </Td>

                    <Td maxW="420px">
                      <Text noOfLines={2} color="gray.600">
                        {cat.description || "—"}
                      </Text>
                      {cat.status === "rejected" && cat.reviewComment ? (
                        <Text mt={1} fontSize="xs" color="red.500" noOfLines={2}>
                          Motif: {cat.reviewComment}
                        </Text>
                      ) : null}
                    </Td>

                    <Td>
                      <Badge colorScheme={statusColor(cat.status)}>{statusLabel(cat.status)}</Badge>
                    </Td>

                    <Td isNumeric>{Number.isFinite(cat.sortOrder) ? cat.sortOrder : 0}</Td>

                    <Td>
                      <HStack spacing={2} wrap="wrap">
                        <Button size="xs" variant="outline" onClick={() => submit(cat)} isDisabled={!can(cat.status, "submit")}>
                          Submit
                        </Button>
                        <Button size="xs" colorScheme="green" variant="outline" onClick={() => approve(cat)} isDisabled={!can(cat.status, "approve")}>
                          Approve
                        </Button>
                        <Button size="xs" colorScheme="red" variant="outline" onClick={() => openReject(cat)} isDisabled={!can(cat.status, "reject")}>
                          Reject
                        </Button>
                        <Button size="xs" colorScheme="gray" variant="outline" onClick={() => archive(cat)} isDisabled={!can(cat.status, "archive")}>
                          Archive
                        </Button>
                      </HStack>
                    </Td>

                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<FaEllipsisV />} variant="ghost" size="sm" aria-label="Actions" />
                        <MenuList>
                          <MenuItem icon={<FaEdit />} onClick={() => openEdit(cat)}>
                            Modifier
                          </MenuItem>
                          <MenuItem icon={<FaTrash />} onClick={() => confirmDelete(cat)} color="red.500">
                            Supprimer
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}

                {rows.length === 0 && (
                  <Tr>
                    <Td colSpan={7}>
                      <Flex py={10} justify="center" color="gray.500">
                        {emptyText}
                      </Flex>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>

            <Divider my={5} />
            <Flex justify="space-between" align="center" color="gray.600" fontSize="sm" wrap="wrap" gap={3} px={4} pb={4}>
              <Text>
                Page : {pagination.page} / {pagination.pages} • Total : {pagination.total}
              </Text>
              <HStack>
                <Button size="sm" onClick={pagination.onPrev} isDisabled={pagination.page <= 1}>
                  Précédent
                </Button>
                <Button size="sm" onClick={pagination.onNext} isDisabled={pagination.page >= pagination.pages}>
                  Suivant
                </Button>
              </HStack>
            </Flex>
          </>
        )}
      </CardBody>
    </Card>
  );

  return (
    <Container maxW="container.xl" py={6}>
      <Flex justify="space-between" align="center" mb={6} gap={3} wrap="wrap">
        <Heading size="lg">Gestion des Catégories</Heading>
        <HStack spacing={3}>
          <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={openCreate}>
            Nouvelle Catégorie
          </Button>
          <Button leftIcon={<FaRedo />} variant="outline" onClick={loadAll} isDisabled={loading}>
            Rafraîchir
          </Button>
        </HStack>
      </Flex>

      <FilterBar
        left={
          <InputGroup maxW="520px">
            <InputLeftElement>
              <FaSearch color="gray" />
            </InputLeftElement>
            <Input placeholder="Rechercher (nom, slug, description)…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </InputGroup>
        }
        right={
          <Select maxW="220px" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="in_review">En revue</option>
            <option value="rejected">Rejeté</option>
            <option value="published">Publié</option>
            <option value="archived">Archivé</option>
          </Select>
        }
      />

      <Tabs isFitted variant="enclosed" colorScheme="teal">
        <TabList mb="1em">
          <Tab>Toutes</Tab>
          <Tab>
            En revue{" "}
            {reviewCategories.length > 0 ? (
              <Badge ml={2} colorScheme="blue" borderRadius="full">
                {reviewCategories.length}
              </Badge>
            ) : null}
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            {renderTable(pagedCategories, "Aucune catégorie", {
              page: pageAll,
              pages: pagesAll,
              total: filteredCategories.length,
              onPrev: () => setPageAll((p) => Math.max(1, p - 1)),
              onNext: () => setPageAll((p) => Math.min(pagesAll, p + 1)),
            })}
          </TabPanel>

          <TabPanel p={0}>
            {renderTable(pagedReviewCategories, "Aucune catégorie en revue", {
              page: pageReview,
              pages: pagesReview,
              total: filteredReview.length,
              onPrev: () => setPageReview((p) => Math.max(1, p - 1)),
              onNext: () => setPageReview((p) => Math.min(pagesReview, p + 1)),
            })}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {}
      <Modal isOpen={isOpen} onClose={saving ? () => { } : onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedCategory ? "Modifier la catégorie" : "Créer une catégorie"}</ModalHeader>
          <ModalCloseButton disabled={saving} />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nom</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData((p) => ({ ...p, name, slug: p.slug ? p.slug : normalize(name) }));
                  }}
                  placeholder="Nom de la catégorie"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Slug</FormLabel>
                <Input value={formData.slug} onChange={(e) => setFormData((p) => ({ ...p, slug: normalize(e.target.value) }))} placeholder="ex: intelligence-economique" />
                <FormHelperText>Auto-généré à partir du nom si vide.</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} placeholder="Description (optionnelle)" rows={4} />
              </FormControl>

              <HStack w="100%" spacing={4} align="start">
                <FormControl>
                  <FormLabel>Image (URL)</FormLabel>
                  <Input value={formData.image} onChange={(e) => setFormData((p) => ({ ...p, image: e.target.value }))} placeholder="https://…" />
                </FormControl>

                <FormControl>
                  <FormLabel>Couleur</FormLabel>
                  <Input value={formData.color} onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))} placeholder="#1E40AF" />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Ordre</FormLabel>
                <Input type="number" value={String(formData.sortOrder)} onChange={(e) => setFormData((p) => ({ ...p, sortOrder: Number(e.target.value || 0) }))} placeholder="0" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={saving}>
              Annuler
            </Button>
            <Button colorScheme="teal" onClick={handleSave} isLoading={saving}>
              {selectedCategory ? "Mettre à jour" : "Créer"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {}
      <AlertDialog isOpen={isRejectOpen} leastDestructiveRef={cancelRef} onClose={onRejectClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Rejeter la catégorie</AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={2}>
                Motif de rejet pour <b>{selectedCategory?.name}</b>
              </Text>
              <Textarea value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} placeholder="Explique pourquoi (optionnel)" rows={4} />
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onRejectClose}>
                Annuler
              </Button>
              <Button colorScheme="red" onClick={confirmReject} ml={3}>
                Rejeter
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Supprimer la catégorie</AlertDialogHeader>
            <AlertDialogBody>Êtes-vous sûr de vouloir supprimer "{selectedCategory?.name}" ? Cette action est irréversible.</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Annuler
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Supprimer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default CategoriesDashboard;
