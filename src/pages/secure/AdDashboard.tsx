import {
  Badge,
  Button,
  Card,
  CardBody,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Td,
  Tr,
  Tbody,
  Th,
  Thead,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaArchive,
  FaChartLine,
  FaCheck,
  FaDollarSign,
  FaEdit,
  FaEllipsisV,
  FaEye,
  FaMousePointer,
  FaPaperPlane,
  FaPlus,
  FaRedo,
  FaSearch,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import { adsService, type AdWorkflowStatus } from "../../services/adsService";
import type { AdDto, AdType } from "../../types";
import AppTable from "../ui/AppTable";
import { EmptyRow } from "../ui/EmptyRow";
import FilterBar from "../ui/FilterBar";
import { useClampPagination } from "../../hooks/useClampPagination";
import {
  normalize,
  normalizeType,
  toNumber,
  ctrPercent,
  typeLabel,
  workflowColor,
  workflowLabel,
} from "../../utils/utils";
import { PAGE_SIZE } from "../../constantes";
import { useAuth } from "../../contexts/AuthContext";

import PlacementDashboard from "./PlacementDashboard";
import AdEditorModal from "./modal/AdEditorModal";

const AdDashboard = () => {
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Editor modal (create/edit)
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Delete dialog
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // Reject modal
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();

  // Preview modal (NEW)
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();

  const { user } = useAuth();
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

  const [tabIndex, setTabIndex] = useState(0);

  const [rejectComment, setRejectComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [ads, setAds] = useState<AdDto[]>([]);
  const [reviewAds, setReviewAds] = useState<AdDto[]>([]);

  // Filters: PUBLICITÉS
  const [qAll, setQAll] = useState("");
  const [statusAll, setStatusAll] = useState<"all" | AdWorkflowStatus>("all");
  const [typeAll, setTypeAll] = useState<"all" | AdType>("all");

  // Filters: EN REVUE
  const [qReview, setQReview] = useState("");
  const [statusReview, setStatusReview] = useState<"all" | AdWorkflowStatus>("all");
  const [typeReview, setTypeReview] = useState<"all" | AdType>("all");

  // Pagination
  const [pageAll, setPageAll] = useState(1);
  const [pageReview, setPageReview] = useState(1);

  const [selectedAd, setSelectedAd] = useState<AdDto | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [list, rq] = await Promise.all([
        adsService.getAds().catch(() => [] as AdDto[]),
        canReview ? adsService.getReviewQueue().catch(() => [] as AdDto[]) : Promise.resolve([] as AdDto[]),
      ]);
      setAds(Array.isArray(list) ? list : []);
      setReviewAds(Array.isArray(rq) ? rq : []);
    } catch (e: any) {
      if (e?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/auth/login";
        return;
      }
      toast({
        title: "Erreur chargement",
        description: e?.message || "Impossible de charger les publicités",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canReview]);

  const isUserAd = useCallback(
    (ad: AdDto) => {
      if (!userId) return false;
      const createdById = String((ad as any).createdById ?? "");
      if (createdById && createdById === userId) return true;
      const submittedById = String((ad as any).submittedById ?? "");
      if (submittedById && submittedById === userId) return true;
      return false;
    },
    [userId]
  );

  const canActAd = useCallback(
    (ad: AdDto, action: "edit" | "delete" | "submit" | "approve" | "reject" | "archive") => {
      if (isPrivileged) return true;
      if (!isJournalist) return false;
      if (!isUserAd(ad)) return false;

      const s = String(ad.status ?? "").toLowerCase();
      if (action === "edit" || action === "submit") return s === "draft" || s === "rejected";
      return false;
    },
    [isPrivileged, isJournalist, isUserAd]
  );

  // Reset pagination when filters change
  useEffect(() => setPageAll(1), [qAll, statusAll, typeAll]);
  useEffect(() => setPageReview(1), [qReview, statusReview, typeReview]);

  // Disallow "in_review" filter for non reviewers
  useEffect(() => {
    if (canReview) return;
    if (statusAll === "in_review") setStatusAll("all");
  }, [canReview, statusAll]);

  const filteredAds = useMemo(() => {
    const q = qAll.trim().toLowerCase();
    const base = ads.filter((ad) => {
      const t = normalizeType(ad.type);
      const s = String(ad.status ?? "draft") as AdWorkflowStatus;

      const matchesSearch =
        !q || (ad.title || "").toLowerCase().includes(q) || (ad.content || "").toLowerCase().includes(q);

      const matchesStatus = statusAll === "all" ? true : s === statusAll;
      const matchesType = typeAll === "all" ? true : t === typeAll;

      return matchesSearch && matchesStatus && matchesType;
    });

    if (canReview) return base;
    return base.filter((ad) => String(ad.status ?? "").toLowerCase() !== "in_review" && isUserAd(ad));
  }, [ads, qAll, statusAll, typeAll, canReview, isUserAd]);

  const filteredReviewAds = useMemo(() => {
    if (!canReview) return [];
    const q = qReview.trim().toLowerCase();
    return reviewAds.filter((ad) => {
      const t = normalizeType(ad.type);
      const s = String(ad.status ?? "draft") as AdWorkflowStatus;

      const matchesSearch =
        !q || (ad.title || "").toLowerCase().includes(q) || (ad.content || "").toLowerCase().includes(q);

      const matchesStatus = statusReview === "all" ? true : s === statusReview;
      const matchesType = typeReview === "all" ? true : t === typeReview;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [reviewAds, qReview, statusReview, typeReview, canReview]);

  const pagesAll = useMemo(() => Math.max(1, Math.ceil(filteredAds.length / PAGE_SIZE)), [filteredAds.length]);
  const pagesReview = useMemo(
    () => Math.max(1, Math.ceil(filteredReviewAds.length / PAGE_SIZE)),
    [filteredReviewAds.length]
  );

  useClampPagination(pagesAll, setPageAll);
  useClampPagination(pagesReview, setPageReview);

  const pagedAds = useMemo(() => {
    const start = (pageAll - 1) * PAGE_SIZE;
    return filteredAds.slice(start, start + PAGE_SIZE);
  }, [filteredAds, pageAll]);

  const pagedReviewAds = useMemo(() => {
    const start = (pageReview - 1) * PAGE_SIZE;
    return filteredReviewAds.slice(start, start + PAGE_SIZE);
  }, [filteredReviewAds, pageReview]);

  const totals = useMemo(() => {
    const totalRevenue = ads.reduce((sum, a) => sum + toNumber((a as any).totalRevenue, 0), 0);
    const totalImpressions = ads.reduce((sum, a) => sum + toNumber((a as any).impressions, 0), 0);
    const totalClicks = ads.reduce((sum, a) => sum + toNumber((a as any).clicks, 0), 0);
    const totalCtr = ctrPercent(totalClicks, totalImpressions);
    return { totalRevenue, totalImpressions, totalClicks, totalCtr };
  }, [ads]);

  const openCreate = () => {
    if (!canCreate) return;
    setSelectedAd(null);
    onOpen();
  };

  const openEdit = (ad: AdDto) => {
    if (!canActAd(ad, "edit")) return;
    setSelectedAd(ad);
    onOpen();
  };

  const confirmDelete = (ad: AdDto) => {
    if (!canActAd(ad, "delete")) return;
    setSelectedAd(ad);
    onDeleteOpen();
  };

  const openPreview = (ad: AdDto) => {
    setSelectedAd(ad);
    onPreviewOpen();
  };

  const saveFromModal = async (payload: {
    title: string;
    content: string;
    image: string | null;
    link: string | null;
    type: AdType;
    placementKey: string | null;
    startDate: string | null;
    endDate: string | null;
  }) => {
    setSaving(true);
    try {
      if (selectedAd?.id) {
        if (!canActAd(selectedAd, "edit")) return;
        await adsService.updateAd(selectedAd.id, payload);
        toast({ title: "Publicité mise à jour", status: "success", duration: 2500, isClosable: true });
      } else {
        if (!canCreate) return;
        await adsService.createAd(payload);
        toast({ title: "Publicité créée (brouillon)", status: "success", duration: 2500, isClosable: true });
      }
      onClose();
      await loadAll();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Échec de l’enregistrement",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAd?.id) return;
    if (!canActAd(selectedAd, "delete")) return;

    setSaving(true);
    try {
      await adsService.deleteAd(selectedAd.id);
      toast({ title: "Publicité supprimée", status: "success", duration: 2500, isClosable: true });
      onDeleteClose();
      await loadAll();
    } catch (e: any) {
      toast({
        title: "Erreur suppression",
        description: e?.message || "Impossible de supprimer",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const submitForReview = async (ad: AdDto) => {
    if (!canActAd(ad, "submit")) return;
    try {
      await adsService.submitForReview(ad.id);
      toast({ title: "Envoyée en revue", status: "success", duration: 2500, isClosable: true });
      await loadAll();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Impossible d’envoyer en revue",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    }
  };

  const approve = async (ad: AdDto) => {
    if (!canActAd(ad, "approve")) return;
    try {
      await adsService.approve(ad.id);
      toast({ title: "Publicité approuvée (publiée)", status: "success", duration: 2500, isClosable: true });
      await loadAll();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Impossible d’approuver",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    }
  };

  const openReject = (ad: AdDto) => {
    if (!canActAd(ad, "reject")) return;
    setSelectedAd(ad);
    setRejectComment("");
    onRejectOpen();
  };

  const confirmReject = async () => {
    if (!selectedAd?.id) return;
    if (!canActAd(selectedAd, "reject")) return;
    try {
      await adsService.reject(selectedAd.id, rejectComment || "Rejetée");
      toast({ title: "Publicité rejetée", status: "info", duration: 2500, isClosable: true });
      onRejectClose();
      await loadAll();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Impossible de rejeter",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    }
  };

  const archive = async (ad: AdDto) => {
    if (!canActAd(ad, "archive")) return;
    try {
      await adsService.archive(ad.id);
      toast({ title: "Publicité archivée", status: "success", duration: 2500, isClosable: true });
      await loadAll();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Impossible d’archiver",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    }
  };

  const renderRow = (ad: AdDto, actionsVariant: "all" | "review") => {
    const t = normalizeType(ad.type);
    const s = String(ad.status ?? "draft") as AdWorkflowStatus;

    const impressions = toNumber((ad as any).impressions, 0);
    const clicks = toNumber((ad as any).clicks, 0);
    const ctr = ctrPercent(clicks, impressions);

    const canEdit = canActAd(ad, "edit");
    const canDeleteRow = canActAd(ad, "delete");
    const canSubmit = canActAd(ad, "submit");
    const canApprove = canActAd(ad, "approve");
    const canRejectRow = canActAd(ad, "reject");
    const canArchiveRow = canActAd(ad, "archive");

    return (
      <Tr key={ad.id}>
        <Td>
          <HStack spacing={3}>
            <Image
              src={(ad as any).image || undefined}
              alt={ad.title}
              boxSize="60px"
              objectFit="cover"
              borderRadius="md"
              fallbackSrc="https://via.placeholder.com/60x60/CBD5E0/718096?text=Ad"
            />
            <VStack align="start" spacing={0} maxW="420px">
              <Text fontWeight="semibold" noOfLines={1}>
                {ad.title}
              </Text>
              <Text fontSize="sm" color="gray.600" noOfLines={1}>
                {ad.content}
              </Text>

              {(ad as any).placementKey ? (
                <Text fontSize="xs" color="purple.600" noOfLines={1}>
                  Slot: {(ad as any).placementKey}
                </Text>
              ) : null}

              {ad.reviewComment ? (
                <Text fontSize="xs" color="red.600" noOfLines={1}>
                  Motif: {ad.reviewComment}
                </Text>
              ) : null}
            </VStack>
          </HStack>
        </Td>

        <Td>
          <Badge colorScheme="blue" variant="subtle">
            {typeLabel(t)}
          </Badge>
        </Td>

        <Td>
          <Badge colorScheme={workflowColor(s)}>{workflowLabel(s)}</Badge>
        </Td>

        <Td isNumeric>{impressions.toLocaleString()}</Td>
        <Td isNumeric>{clicks.toLocaleString()}</Td>
        <Td isNumeric>{ctr.toFixed(2)}%</Td>

        <Td>
          <Menu>
            <MenuButton as={IconButton} icon={<FaEllipsisV />} variant="ghost" size="sm" aria-label="Actions" />
            <MenuList>
              <MenuItem icon={<FaEye />} onClick={() => openPreview(ad)}>
                Prévisualiser
              </MenuItem>

              {actionsVariant === "all" ? (
                <>
                  {s === "draft" || s === "rejected" ? (
                    <MenuItem icon={<FaPaperPlane />} onClick={() => submitForReview(ad)} isDisabled={!canSubmit}>
                      Envoyer en revue
                    </MenuItem>
                  ) : null}

                  {s === "in_review" ? (
                    <>
                      <MenuItem icon={<FaCheck />} onClick={() => approve(ad)} isDisabled={!canApprove}>
                        Approuver (publier)
                      </MenuItem>
                      <MenuItem icon={<FaTimes />} onClick={() => openReject(ad)} color="red.500" isDisabled={!canRejectRow}>
                        Rejeter
                      </MenuItem>
                    </>
                  ) : null}

                  {s === "published" ? (
                    <MenuItem icon={<FaArchive />} onClick={() => archive(ad)} isDisabled={!canArchiveRow}>
                      Archiver
                    </MenuItem>
                  ) : null}

                  <MenuItem icon={<FaEdit />} onClick={() => openEdit(ad)} isDisabled={s === "archived" || !canEdit}>
                    Modifier
                  </MenuItem>

                  <MenuItem icon={<FaTrash />} onClick={() => confirmDelete(ad)} color="red.500" isDisabled={!canDeleteRow}>
                    Supprimer
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem icon={<FaCheck />} onClick={() => approve(ad)} isDisabled={!canApprove}>
                    Approuver (publier)
                  </MenuItem>
                  <MenuItem icon={<FaTimes />} onClick={() => openReject(ad)} color="red.500" isDisabled={!canRejectRow}>
                    Rejeter
                  </MenuItem>
                </>
              )}
            </MenuList>
          </Menu>
        </Td>
      </Tr>
    );
  };

  const FilterBarAll = (
    <FilterBar
      left={
        <InputGroup maxW="520px">
          <InputLeftElement>
            <FaSearch color="gray" />
          </InputLeftElement>
          <Input placeholder="Rechercher (titre, contenu)…" value={qAll} onChange={(e) => setQAll(e.target.value)} />
        </InputGroup>
      }
      right={
        <HStack spacing={3} wrap="wrap">
          <Select maxW="220px" value={statusAll} onChange={(e) => setStatusAll(e.target.value as any)}>
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            {canReview ? <option value="in_review">En revue</option> : null}
            <option value="rejected">Rejetée</option>
            <option value="published">Publiée</option>
            <option value="archived">Archivée</option>
          </Select>

          <Select maxW="220px" value={typeAll} onChange={(e) => setTypeAll(e.target.value as any)}>
            <option value="all">Tous les types</option>
            <option value="banner">Bannière</option>
            <option value="sidebar">Barre latérale</option>
            <option value="popup">Pop-up</option>
            <option value="inline">Inline</option>
          </Select>
        </HStack>
      }
    />
  );

  const FilterBarReview = (
    <FilterBar
      left={
        <InputGroup maxW="520px">
          <InputLeftElement>
            <FaSearch color="gray" />
          </InputLeftElement>
          <Input placeholder="Rechercher (titre, contenu)…" value={qReview} onChange={(e) => setQReview(e.target.value)} />
        </InputGroup>
      }
      right={
        <HStack spacing={3} wrap="wrap">
          <Select maxW="220px" value={statusReview} onChange={(e) => setStatusReview(e.target.value as any)}>
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="in_review">En revue</option>
            <option value="rejected">Rejetée</option>
            <option value="published">Publiée</option>
            <option value="archived">Archivée</option>
          </Select>

          <Select maxW="220px" value={typeReview} onChange={(e) => setTypeReview(e.target.value as any)}>
            <option value="all">Tous les types</option>
            <option value="banner">Bannière</option>
            <option value="sidebar">Barre latérale</option>
            <option value="popup">Pop-up</option>
            <option value="inline">Inline</option>
          </Select>
        </HStack>
      }
    />
  );

  const showPlacementsTab = isPrivileged;
  const tabsCount = 1 + (canReview ? 1 : 0) + (showPlacementsTab ? 1 : 0);

  return (
    <Container maxW="container.xl" py={6}>
      <Flex justify="space-between" align="center" mb={6} gap={3} wrap="wrap">
        <Heading size="lg">Gestion des Publicités</Heading>
        <HStack spacing={3}>
          <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={openCreate} isDisabled={!canCreate}>
            Nouvelle Publicité
          </Button>
          <Button leftIcon={<FaRedo />} variant="outline" onClick={loadAll} isDisabled={loading}>
            Rafraîchir
          </Button>

          {canReview && reviewAds.length > 0 ? (
            <Badge colorScheme="blue" variant="solid" borderRadius="full" px={3}>
              {reviewAds.length} en revue
            </Badge>
          ) : null}
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Revenu total</StatLabel>
              <StatNumber>
                <FaDollarSign style={{ display: "inline", marginRight: 6 }} />
                {totals.totalRevenue.toLocaleString()}€
              </StatNumber>
              <StatHelpText>Total enregistré</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Impressions</StatLabel>
              <StatNumber>
                <FaEye style={{ display: "inline", marginRight: 6 }} />
                {totals.totalImpressions.toLocaleString()}
              </StatNumber>
              <StatHelpText>Vues totales</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Clics</StatLabel>
              <StatNumber>
                <FaMousePointer style={{ display: "inline", marginRight: 6 }} />
                {totals.totalClicks.toLocaleString()}
              </StatNumber>
              <StatHelpText>Engagements</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>CTR moyen</StatLabel>
              <StatNumber>
                <FaChartLine style={{ display: "inline", marginRight: 6 }} />
                {totals.totalCtr.toFixed(2)}%
              </StatNumber>
              <StatHelpText>Taux de clic</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Tabs
        isFitted={tabsCount <= 3}
        variant="enclosed"
        colorScheme="teal"
        index={tabIndex}
        onChange={setTabIndex}
      >
        <TabList mb="1em">
          <Tab>Publicités</Tab>

          {canReview ? (
            <Tab>
              En revue{" "}
              {reviewAds.length > 0 ? (
                <Badge ml={2} colorScheme="blue" borderRadius="full">
                  {reviewAds.length}
                </Badge>
              ) : null}
            </Tab>
          ) : null}

          {showPlacementsTab ? <Tab>Placements</Tab> : null}
        </TabList>

        <TabPanels>
          {/* PUBLICITÉS */}
          <TabPanel p={0}>
            {FilterBarAll}

            <Card>
              <CardBody p={0}>
                {loading ? (
                  <Flex py={10} justify="center">
                    <Spinner size="lg" />
                  </Flex>
                ) : (
                  <>
                    <AppTable>
                      <Thead>
                        <Tr>
                          <Th>Publicité</Th>
                          <Th>Type</Th>
                          <Th>Statut</Th>
                          <Th isNumeric>Impressions</Th>
                          <Th isNumeric>Clics</Th>
                          <Th isNumeric>CTR</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {pagedAds.map((ad) => renderRow(ad, "all"))}
                        {pagedAds.length === 0 ? <EmptyRow colSpan={7}>Aucune publicité</EmptyRow> : null}
                      </Tbody>
                    </AppTable>

                    <Divider my={5} />
                    <Flex
                      justify="space-between"
                      align="center"
                      color="gray.600"
                      fontSize="sm"
                      wrap="wrap"
                      gap={3}
                      px={4}
                      pb={4}
                    >
                      <Text>
                        Page : {pageAll} / {pagesAll} • Total : {filteredAds.length}
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
              </CardBody>
            </Card>
          </TabPanel>

          {/* EN REVUE */}
          {canReview ? (
            <TabPanel p={0}>
              {FilterBarReview}

              <Card>
                <CardBody p={0}>
                  {loading ? (
                    <Flex py={10} justify="center">
                      <Spinner size="lg" />
                    </Flex>
                  ) : (
                    <>
                      <AppTable>
                        <Thead>
                          <Tr>
                            <Th>Publicité</Th>
                            <Th>Type</Th>
                            <Th>Statut</Th>
                            <Th isNumeric>Impressions</Th>
                            <Th isNumeric>Clics</Th>
                            <Th isNumeric>CTR</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {pagedReviewAds.map((ad) => renderRow(ad, "review"))}
                          {pagedReviewAds.length === 0 ? <EmptyRow colSpan={7}>Aucune publicité en revue</EmptyRow> : null}
                        </Tbody>
                      </AppTable>

                      <Divider my={5} />
                      <Flex
                        justify="space-between"
                        align="center"
                        color="gray.600"
                        fontSize="sm"
                        wrap="wrap"
                        gap={3}
                        px={4}
                        pb={4}
                      >
                        <Text>
                          Page : {pageReview} / {pagesReview} • Total : {filteredReviewAds.length}
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
                </CardBody>
              </Card>
            </TabPanel>
          ) : null}

          {/* PLACEMENTS */}
          {showPlacementsTab ? (
            <TabPanel p={0}>
              <PlacementDashboard />
            </TabPanel>
          ) : null}
        </TabPanels>
      </Tabs>

      {/* CREATE/EDIT MODAL */}
      <AdEditorModal
        isOpen={isOpen}
        onClose={onClose}
        saving={saving}
        selectedAd={selectedAd}
        canSave={selectedAd ? canActAd(selectedAd, "edit") : canCreate}
        onSave={saveFromModal}
      />

      {/* PREVIEW MODAL */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Prévisualisation de la publicité</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedAd ? (
              <HStack spacing={4} align="start">
                <Image
                  src={(selectedAd as any).image || undefined}
                  fallbackSrc="https://via.placeholder.com/480x270/CBD5E0/718096?text=Preview"
                  alt={selectedAd.title}
                  borderRadius="md"
                  objectFit="cover"
                  w={{ base: "140px", md: "280px" }}
                  h={{ base: "100px", md: "180px" }}
                />

                <VStack align="start" spacing={2} flex={1}>
                  <Text fontWeight="bold" fontSize="lg">
                    {selectedAd.title}
                  </Text>

                  <Text color="gray.600">{selectedAd.content}</Text>

                  {(selectedAd as any).link ? (
                    <Text fontSize="sm" color="teal.600">
                      Lien : {(selectedAd as any).link}
                    </Text>
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      Aucun lien
                    </Text>
                  )}

                  {(selectedAd as any).placementKey ? (
                    <Badge colorScheme="purple" variant="subtle">
                      Emplacement : {(selectedAd as any).placementKey}
                    </Badge>
                  ) : null}

                  <HStack spacing={2}>
                    <Badge colorScheme="blue" variant="subtle">
                      {typeLabel(normalizeType((selectedAd as any).type))}
                    </Badge>
                    <Badge colorScheme={workflowColor(String((selectedAd as any).status ?? "draft") as any)}>
                      {workflowLabel(String((selectedAd as any).status ?? "draft") as any)}
                    </Badge>
                  </HStack>
                </VStack>
              </HStack>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onPreviewClose}>Fermer</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* REJECT MODAL */}
      <Modal isOpen={isRejectOpen} onClose={onRejectClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Rejeter la publicité</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Commentaire (raison)</FormLabel>
              <Textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Ex: contenu non conforme, lien invalide, image manquante..."
                rows={4}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRejectClose}>
              Annuler
            </Button>
            <Button colorScheme="red" onClick={confirmReject}>
              Rejeter
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* DELETE DIALOG */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Supprimer la publicité</AlertDialogHeader>
            <AlertDialogBody>
              Êtes-vous sûr de vouloir supprimer "{selectedAd?.title}" ? Cette action est irréversible.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose} isDisabled={saving}>
                Annuler
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3} isLoading={saving}>
                Supprimer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default AdDashboard;
