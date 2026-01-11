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
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Progress,
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
import { useEffect, useMemo, useRef, useState } from "react";
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
import { useResetPaginationOnChange } from "../../hooks/useResetPaginationOnChange";
import { useClampPagination } from "../../hooks/useClampPagination";
import { normalizeType, toNumber, ctrPercent, toDateInputValue, toIsoOrNullFromDateInput, typeLabel, workflowColor, workflowLabel } from "../../utils/utils";
import { PAGE_SIZE } from "../../constantes";

const AdDashboard = () => {
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();

  const [rejectComment, setRejectComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [ads, setAds] = useState<AdDto[]>([]);
  const [reviewAds, setReviewAds] = useState<AdDto[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | AdWorkflowStatus>("all");
  const [filterType, setFilterType] = useState<"all" | AdType>("all");

  const [pageAll, setPageAll] = useState(1);
  const [pageReview, setPageReview] = useState(1);

  const [selectedAd, setSelectedAd] = useState<AdDto | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    image: string;
    link: string;
    type: AdType;
    startDate: string;
    endDate: string;
    impressions: number;
    clicks: number;
    totalRevenue: number;
  }>({
    title: "",
    content: "",
    image: "",
    link: "",
    type: "banner",
    startDate: "",
    endDate: "",
    impressions: 0,
    clicks: 0,
    totalRevenue: 0,
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [list, rq] = await Promise.all([
        adsService.getAds().catch(() => [] as AdDto[]),
        adsService.getReviewQueue().catch(() => [] as AdDto[]),
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
  }, []);

  useResetPaginationOnChange([searchTerm, filterStatus, filterType], () => {
    setPageAll(1);
    setPageReview(1);
  });

  const filteredAds = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return ads.filter((ad) => {
      const t = normalizeType(ad.type);
      const s = String(ad.status ?? "draft") as AdWorkflowStatus;

      const matchesSearch =
        !q || (ad.title || "").toLowerCase().includes(q) || (ad.content || "").toLowerCase().includes(q);

      const matchesStatus = filterStatus === "all" ? true : s === filterStatus;
      const matchesType = filterType === "all" ? true : t === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [ads, searchTerm, filterStatus, filterType]);

  const filteredReviewAds = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return reviewAds.filter((ad) => {
      const t = normalizeType(ad.type);
      const s = String(ad.status ?? "draft") as AdWorkflowStatus;

      const matchesSearch =
        !q || (ad.title || "").toLowerCase().includes(q) || (ad.content || "").toLowerCase().includes(q);

      const matchesStatus = filterStatus === "all" ? true : s === filterStatus;
      const matchesType = filterType === "all" ? true : t === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [reviewAds, searchTerm, filterStatus, filterType]);

  const pagesAll = useMemo(() => Math.max(1, Math.ceil(filteredAds.length / PAGE_SIZE)), [filteredAds.length]);
  const pagesReview = useMemo(() => Math.max(1, Math.ceil(filteredReviewAds.length / PAGE_SIZE)), [filteredReviewAds.length]);

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
    setSelectedAd(null);
    setFormData({
      title: "",
      content: "",
      image: "",
      link: "",
      type: "banner",
      startDate: "",
      endDate: "",
      impressions: 0,
      clicks: 0,
      totalRevenue: 0,
    });
    onOpen();
  };

  const openEdit = (ad: AdDto) => {
    setSelectedAd(ad);
    setFormData({
      title: ad.title || "",
      content: ad.content || "",
      image: String(ad.image ?? ""),
      link: String(ad.link ?? ""),
      type: normalizeType(ad.type),
      startDate: toDateInputValue(ad.startDate),
      endDate: toDateInputValue(ad.endDate),
      impressions: toNumber((ad as any).impressions, 0),
      clicks: toNumber((ad as any).clicks, 0),
      totalRevenue: toNumber((ad as any).totalRevenue, 0),
    });
    onOpen();
  };

  const confirmDelete = (ad: AdDto) => {
    setSelectedAd(ad);
    onDeleteOpen();
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Champs requis",
        description: "Titre et contenu sont obligatoires.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const payload = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      image: formData.image.trim() ? formData.image.trim() : null,
      link: formData.link.trim() ? formData.link.trim() : null,
      type: formData.type,
      startDate: toIsoOrNullFromDateInput(formData.startDate),
      endDate: toIsoOrNullFromDateInput(formData.endDate),
    };

    setSaving(true);
    try {
      if (selectedAd?.id) {
        await adsService.updateAd(selectedAd.id, payload);
        toast({ title: "Publicité mise à jour", status: "success", duration: 2500, isClosable: true });
      } else {
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
    setSelectedAd(ad);
    setRejectComment("");
    onRejectOpen();
  };

  const confirmReject = async () => {
    if (!selectedAd?.id) return;
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

    return (
      <Tr key={ad.id}>
        <Td>
          <HStack spacing={3}>
            <Image
              src={ad.image || undefined}
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
              <MenuItem icon={<FaEye />} isDisabled>
                Prévisualiser
              </MenuItem>

              {actionsVariant === "all" ? (
                <>
                  {s === "draft" || s === "rejected" ? (
                    <MenuItem icon={<FaPaperPlane />} onClick={() => submitForReview(ad)}>
                      Envoyer en revue
                    </MenuItem>
                  ) : null}

                  {s === "in_review" ? (
                    <>
                      <MenuItem icon={<FaCheck />} onClick={() => approve(ad)}>
                        Approuver (publier)
                      </MenuItem>
                      <MenuItem icon={<FaTimes />} onClick={() => openReject(ad)} color="red.500">
                        Rejeter
                      </MenuItem>
                    </>
                  ) : null}

                  {s === "published" ? (
                    <MenuItem icon={<FaArchive />} onClick={() => archive(ad)}>
                      Archiver
                    </MenuItem>
                  ) : null}

                  <MenuItem icon={<FaEdit />} onClick={() => openEdit(ad)} isDisabled={s === "archived"}>
                    Modifier
                  </MenuItem>

                  <MenuItem icon={<FaTrash />} onClick={() => confirmDelete(ad)} color="red.500">
                    Supprimer
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem icon={<FaCheck />} onClick={() => approve(ad)}>
                    Approuver (publier)
                  </MenuItem>
                  <MenuItem icon={<FaTimes />} onClick={() => openReject(ad)} color="red.500">
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

  return (
    <Container maxW="container.xl" py={6}>
      <Flex justify="space-between" align="center" mb={6} gap={3} wrap="wrap">
        <Heading size="lg">Gestion des Publicités</Heading>
        <HStack spacing={3}>
          <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={openCreate}>
            Nouvelle Publicité
          </Button>
          <Button leftIcon={<FaRedo />} variant="outline" onClick={loadAll} isDisabled={loading}>
            Rafraîchir
          </Button>

          {reviewAds.length > 0 ? (
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

      <Tabs isFitted variant="enclosed" colorScheme="teal">
        <TabList mb="1em">
          <Tab>Toutes</Tab>
          <Tab>
            En revue{" "}
            {reviewAds.length > 0 ? (
              <Badge ml={2} colorScheme="blue" borderRadius="full">
                {reviewAds.length}
              </Badge>
            ) : null}
          </Tab>
        </TabList>

        <TabPanels>
          {}
          <TabPanel p={0}>
            <FilterBar
              left={
                <InputGroup maxW="520px">
                  <InputLeftElement>
                    <FaSearch color="gray" />
                  </InputLeftElement>
                  <Input
                    placeholder="Rechercher (titre, contenu)…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              }
              right={
                <SimpleGrid columns={{ base: 2, md: 2 }} spacing={3} minW={{ base: "full", md: "auto" }}>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="draft">Brouillon</option>
                    <option value="in_review">En revue</option>
                    <option value="rejected">Rejetée</option>
                    <option value="published">Publiée</option>
                    <option value="archived">Archivée</option>
                  </Select>

                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                  >
                    <option value="all">Tous les types</option>
                    <option value="banner">Bannière</option>
                    <option value="sidebar">Barre latérale</option>
                    <option value="popup">Pop-up</option>
                    <option value="inline">Inline</option>
                  </Select>
                </SimpleGrid>
              }
            />
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
                    <Flex justify="space-between" align="center" color="gray.600" fontSize="sm" wrap="wrap" gap={3} px={4} pb={4}>
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

          {}
          <TabPanel p={0}>
            <FilterBar
              left={
                <InputGroup maxW="520px">
                  <InputLeftElement>
                    <FaSearch color="gray" />
                  </InputLeftElement>
                  <Input
                    placeholder="Rechercher (titre, contenu)…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              }
              right={
                <>
                  <Select maxW="220px" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
                    <option value="all">Tous les statuts</option>
                    <option value="draft">Brouillon</option>
                    <option value="in_review">En revue</option>
                    <option value="rejected">Rejetée</option>
                    <option value="published">Publiée</option>
                    <option value="archived">Archivée</option>
                  </Select>

                  <Select maxW="220px" value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
                    <option value="all">Tous les types</option>
                    <option value="banner">Bannière</option>
                    <option value="sidebar">Barre latérale</option>
                    <option value="popup">Pop-up</option>
                    <option value="inline">Inline</option>
                  </Select>
                </>
              }
            />

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
                    <Flex justify="space-between" align="center" color="gray.600" fontSize="sm" wrap="wrap" gap={3} px={4} pb={4}>
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
        </TabPanels>
      </Tabs>

      {}
      <Modal isOpen={isOpen} onClose={saving ? () => { } : onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedAd ? "Modifier la publicité" : "Créer une publicité (brouillon)"}</ModalHeader>
          <ModalCloseButton disabled={saving} />
          <ModalBody maxH="70vh" overflowY="auto">
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Titre</FormLabel>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Contenu</FormLabel>
                <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} />
              </FormControl>

              <HStack width="100%" spacing={4} align="start">
                <FormControl>
                  <FormLabel>Image (URL)</FormLabel>
                  <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
                </FormControl>

                <FormControl>
                  <FormLabel>Lien (URL)</FormLabel>
                  <Input value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
                </FormControl>
              </HStack>

              <HStack width="100%" spacing={4} align="start">
                <FormControl>
                  <FormLabel>Type</FormLabel>
                  <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as AdType })}>
                    <option value="banner">Bannière</option>
                    <option value="sidebar">Barre latérale</option>
                    <option value="popup">Pop-up</option>
                    <option value="inline">Inline</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Date début</FormLabel>
                  <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                </FormControl>

                <FormControl>
                  <FormLabel>Date fin</FormLabel>
                  <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                </FormControl>
              </HStack>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Impressions</FormLabel>
                  <NumberInput value={formData.impressions} min={0} isReadOnly>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Clics</FormLabel>
                  <NumberInput value={formData.clicks} min={0} isReadOnly>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Revenu total (€)</FormLabel>
                  <NumberInput value={formData.totalRevenue} min={0} precision={2} isReadOnly>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              <Card w="100%">
                <CardBody>
                  <Text fontWeight="semibold" mb={2}>
                    CTR (calculé)
                  </Text>
                  <Progress value={Math.min(100, ctrPercent(formData.clicks, formData.impressions))} size="sm" colorScheme="teal" />
                  <Text mt={2} fontSize="sm" color="gray.600">
                    {ctrPercent(formData.clicks, formData.impressions).toFixed(2)}%
                  </Text>
                </CardBody>
              </Card>

              {selectedAd?.status ? (
                <Badge colorScheme={workflowColor(selectedAd.status)} variant="subtle">
                  Statut actuel: {workflowLabel(selectedAd.status)}
                </Badge>
              ) : null}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={saving}>
              Annuler
            </Button>
            <Button colorScheme="teal" onClick={handleSave} isLoading={saving}>
              {selectedAd ? "Mettre à jour" : "Créer"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {}
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

      {}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Supprimer la publicité</AlertDialogHeader>
            <AlertDialogBody>Êtes-vous sûr de vouloir supprimer "{selectedAd?.title}" ? Cette action est irréversible.</AlertDialogBody>
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
