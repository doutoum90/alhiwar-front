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
  Input,
  InputGroup,
  InputLeftElement,
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
  Switch,
  Text,
  useDisclosure,
  useToast,
  VStack,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Tr,
  Td,
  Th,
  Thead,
  Tbody,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaEdit, FaPlus, FaRedo, FaSearch, FaTrash } from "react-icons/fa";

import AppTable from "../ui/AppTable";
import FilterBar from "../ui/FilterBar";
import { EmptyRow } from "../ui/EmptyRow";
import { PAGE_SIZE } from "../../constantes";
import { adPlacementsService, type AdPlacementDto } from "../../services/adPlacementsService";

type Provider = "manual" | "adsense" | "gam";
type Format = "banner" | "sidebar" | "popup" | "inline";

const providerLabel = (p: Provider) => {
  if (p === "adsense") return "AdSense";
  if (p === "gam") return "Google Ad Manager";
  return "Manual";
};

const providerColor = (p: Provider) => {
  if (p === "adsense") return "purple";
  if (p === "gam") return "orange";
  return "gray";
};

const formatLabel = (f: Format) => {
  if (f === "banner") return "Bannière";
  if (f === "sidebar") return "Barre latérale";
  if (f === "popup") return "Pop-up";
  return "Inline";
};

// "300x250, 300x600" -> [[300,250],[300,600]]
const parseGamSizes = (s: string): Array<[number, number]> | null => {
  const raw = s.trim();
  if (!raw) return null;

  const parts = raw.split(",").map((x) => x.trim()).filter(Boolean);
  const sizes: Array<[number, number]> = [];

  for (const p of parts) {
    const m = p.toLowerCase().replace(/\s+/g, "").match(/^(\d+)x(\d+)$/);
    if (!m) return null;
    const w = Number(m[1]);
    const h = Number(m[2]);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
    sizes.push([w, h]);
  }

  return sizes.length ? sizes : null;
};

const formatGamSizes = (sizes: Array<[number, number]> | null | undefined) => {
  if (!sizes || !sizes.length) return "";
  return sizes.map(([w, h]) => `${w}x${h}`).join(", ");
};

const PlacementDashboard = () => {
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [placements, setPlacements] = useState<AdPlacementDto[]>([]);
  const [selected, setSelected] = useState<AdPlacementDto | null>(null);

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [provider, setProvider] = useState<"all" | Provider>("all");
  const [enabled, setEnabled] = useState<"all" | "enabled" | "disabled">("all");

  // pagination
  const [page, setPage] = useState(1);

  // form
  const [form, setForm] = useState<{
    key: string;
    name: string;
    provider: Provider;
    format: Format;
    enabled: boolean;

    // adsense
    adsenseClientId: string;
    adsenseSlotId: string;
    adsenseFormat: string;
    adsenseResponsive: boolean;

    // gam
    gamNetworkCode: string;
    gamAdUnitPath: string;
    gamSizesText: string;
  }>({
    key: "",
    name: "",
    provider: "adsense",
    format: "banner",
    enabled: true,

    adsenseClientId: "",
    adsenseSlotId: "",
    adsenseFormat: "auto",
    adsenseResponsive: true,

    gamNetworkCode: "",
    gamAdUnitPath: "",
    gamSizesText: "",
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const list = await adPlacementsService.getAll().catch(() => [] as AdPlacementDto[]);
      setPlacements(Array.isArray(list) ? list : []);
    } catch (e: any) {
      toast({
        title: "Erreur chargement",
        description: e?.message || "Impossible de charger les emplacements",
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

  // reset page on filters
  useEffect(() => {
    setPage(1);
  }, [searchTerm, provider, enabled]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return placements.filter((p) => {
      const matchesSearch =
        !q ||
        (p.key || "").toLowerCase().includes(q) ||
        (p.name || "").toLowerCase().includes(q);

      const matchesProvider = provider === "all" ? true : p.provider === provider;
      const matchesEnabled =
        enabled === "all" ? true : enabled === "enabled" ? p.enabled : !p.enabled;

      return matchesSearch && matchesProvider && matchesEnabled;
    });
  }, [placements, searchTerm, provider, enabled]);

  const pages = useMemo(() => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)), [filtered.length]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), pages));
  }, [pages]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const openCreate = () => {
    setSelected(null);
    setForm({
      key: "",
      name: "",
      provider: "adsense",
      format: "banner",
      enabled: true,

      adsenseClientId: "",
      adsenseSlotId: "",
      adsenseFormat: "auto",
      adsenseResponsive: true,

      gamNetworkCode: "",
      gamAdUnitPath: "",
      gamSizesText: "300x250",
    });
    onOpen();
  };

  const openEdit = (p: AdPlacementDto) => {
    setSelected(p);
    setForm({
      key: p.key ?? "",
      name: p.name ?? "",
      provider: p.provider,
      format: (p.format ?? "banner") as Format,
      enabled: !!p.enabled,

      adsenseClientId: p.adsenseClientId ?? "",
      adsenseSlotId: p.adsenseSlotId ?? "",
      adsenseFormat: p.adsenseFormat ?? "auto",
      adsenseResponsive: p.adsenseResponsive ?? true,

      gamNetworkCode: p.gamNetworkCode ?? "",
      gamAdUnitPath: p.gamAdUnitPath ?? "",
      gamSizesText: formatGamSizes(p.gamSizes),
    });
    onOpen();
  };

  const confirmDelete = (p: AdPlacementDto) => {
    setSelected(p);
    onDeleteOpen();
  };

  const validate = () => {
    if (!form.key.trim() || !form.name.trim()) {
      return "Les champs Key et Nom sont obligatoires.";
    }
    if (!/^[a-z0-9_]+$/.test(form.key.trim())) {
      return "Key invalide : utilisez seulement des lettres minuscules, chiffres et _. Exemple: home_sidebar_top";
    }
    if (form.provider === "adsense") {
      if (!form.adsenseClientId.trim() || !form.adsenseSlotId.trim()) {
        return "AdSense: Client ID et Slot ID sont obligatoires.";
      }
    }
    if (form.provider === "gam") {
      if (!form.gamNetworkCode.trim() || !form.gamAdUnitPath.trim()) {
        return "GAM: Network Code et Ad Unit Path sont obligatoires.";
      }
      const sizes = parseGamSizes(form.gamSizesText);
      if (!sizes) return "GAM: tailles invalides. Exemple: 300x250, 300x600";
    }
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      toast({ title: "Validation", description: err, status: "warning", duration: 3500, isClosable: true });
      return;
    }

    const payload: Partial<AdPlacementDto> = {
      key: form.key.trim(),
      name: form.name.trim(),
      provider: form.provider,
      format: form.format,
      enabled: form.enabled,
    };

    if (form.provider === "adsense") {
      payload.adsenseClientId = form.adsenseClientId.trim();
      payload.adsenseSlotId = form.adsenseSlotId.trim();
      payload.adsenseFormat = form.adsenseFormat?.trim() ? form.adsenseFormat.trim() : "auto";
      payload.adsenseResponsive = !!form.adsenseResponsive;

      payload.gamNetworkCode = null;
      payload.gamAdUnitPath = null;
      payload.gamSizes = null;
    } else if (form.provider === "gam") {
      payload.gamNetworkCode = form.gamNetworkCode.trim();
      payload.gamAdUnitPath = form.gamAdUnitPath.trim();
      payload.gamSizes = parseGamSizes(form.gamSizesText);

      payload.adsenseClientId = null;
      payload.adsenseSlotId = null;
      payload.adsenseFormat = null;
      payload.adsenseResponsive = true;
    } else {
      // manual placement: no google config
      payload.adsenseClientId = null;
      payload.adsenseSlotId = null;
      payload.adsenseFormat = null;
      payload.adsenseResponsive = true;
      payload.gamNetworkCode = null;
      payload.gamAdUnitPath = null;
      payload.gamSizes = null;
    }

    setSaving(true);
    try {
      if (selected?.id) {
        await adPlacementsService.update(selected.id, payload);
        toast({ title: "Emplacement mis à jour", status: "success", duration: 2500, isClosable: true });
      } else {
        await adPlacementsService.create(payload);
        toast({ title: "Emplacement créé", status: "success", duration: 2500, isClosable: true });
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
    if (!selected?.id) return;
    setSaving(true);
    try {
      await adPlacementsService.remove(selected.id);
      toast({ title: "Emplacement supprimé", status: "success", duration: 2500, isClosable: true });
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

  return (
    <Container maxW="container.xl" py={6}>
      <Flex justify="space-between" align="center" mb={6} gap={3} wrap="wrap">
        <Heading size="lg">Emplacements Publicitaires</Heading>
        <HStack spacing={3}>
          <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={openCreate}>
            Nouvel emplacement
          </Button>
          <Button leftIcon={<FaRedo />} variant="outline" onClick={loadAll} isDisabled={loading}>
            Rafraîchir
          </Button>
          <Badge colorScheme="blue" variant="solid" borderRadius="full" px={3}>
            {placements.length} total
          </Badge>
        </HStack>
      </Flex>

      <FilterBar
        left={
          <InputGroup maxW="520px">
            <InputLeftElement>
              <FaSearch color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Rechercher (key, nom)…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        }
        right={
          <HStack spacing={3} wrap="wrap">
            <Select maxW="220px" value={provider} onChange={(e) => setProvider(e.target.value as any)}>
              <option value="all">Tous providers</option>
              <option value="adsense">AdSense</option>
              <option value="gam">Google Ad Manager</option>
              <option value="manual">Manual</option>
            </Select>
            <Select maxW="220px" value={enabled} onChange={(e) => setEnabled(e.target.value as any)}>
              <option value="all">Tous statuts</option>
              <option value="enabled">Actifs</option>
              <option value="disabled">Désactivés</option>
            </Select>
          </HStack>
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
                    <Th>Emplacement</Th>
                    <Th>Provider</Th>
                    <Th>Format</Th>
                    <Th>Statut</Th>
                    <Th>Config</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paged.map((p) => (
                    <Tr key={p.id}>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="semibold">{p.name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            key: <Badge variant="subtle">{p.key}</Badge>
                          </Text>
                        </VStack>
                      </Td>

                      <Td>
                        <Badge colorScheme={providerColor(p.provider)}>{providerLabel(p.provider)}</Badge>
                      </Td>

                      <Td>
                        <Badge colorScheme="blue" variant="subtle">
                          {formatLabel(p.format as any)}
                        </Badge>
                      </Td>

                      <Td>
                        {p.enabled ? (
                          <Badge colorScheme="green">Actif</Badge>
                        ) : (
                          <Badge colorScheme="gray">Désactivé</Badge>
                        )}
                      </Td>

                      <Td>
                        {p.provider === "adsense" ? (
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm">client: {p.adsenseClientId || "-"}</Text>
                            <Text fontSize="sm">slot: {p.adsenseSlotId || "-"}</Text>
                          </VStack>
                        ) : p.provider === "gam" ? (
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm">unit: {p.gamAdUnitPath || "-"}</Text>
                            <Text fontSize="sm">sizes: {formatGamSizes(p.gamSizes) || "-"}</Text>
                          </VStack>
                        ) : (
                          <Text fontSize="sm" color="gray.600">
                            (manual)
                          </Text>
                        )}
                      </Td>

                      <Td>
                        <HStack>
                          <IconButton
                            aria-label="Modifier"
                            icon={<FaEdit />}
                            size="sm"
                            variant="ghost"
                            onClick={() => openEdit(p)}
                          />
                          <IconButton
                            aria-label="Supprimer"
                            icon={<FaTrash />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => confirmDelete(p)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                  {paged.length === 0 ? <EmptyRow colSpan={6}>Aucun emplacement</EmptyRow> : null}
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
                  Page : {page} / {pages} • Total : {filtered.length}
                </Text>
                <HStack>
                  <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={page <= 1}>
                    Précédent
                  </Button>
                  <Button size="sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} isDisabled={page >= pages}>
                    Suivant
                  </Button>
                </HStack>
              </Flex>
            </>
          )}
        </CardBody>
      </Card>

      {/* Create / Edit */}
      <Modal isOpen={isOpen} onClose={saving ? () => {} : onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selected ? "Modifier l’emplacement" : "Créer un emplacement"}</ModalHeader>
          <ModalCloseButton disabled={saving} />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Key (unique)</FormLabel>
                  <Input
                    value={form.key}
                    onChange={(e) => setForm((s) => ({ ...s, key: e.target.value }))}
                    placeholder="ex: home_sidebar_top"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Nom</FormLabel>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    placeholder="ex: Homepage sidebar top"
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Provider</FormLabel>
                  <Select
                    value={form.provider}
                    onChange={(e) => setForm((s) => ({ ...s, provider: e.target.value as Provider }))}
                  >
                    <option value="adsense">AdSense</option>
                    <option value="gam">Google Ad Manager</option>
                    <option value="manual">Manual</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Format</FormLabel>
                  <Select
                    value={form.format}
                    onChange={(e) => setForm((s) => ({ ...s, format: e.target.value as Format }))}
                  >
                    <option value="banner">Bannière</option>
                    <option value="sidebar">Barre latérale</option>
                    <option value="popup">Pop-up</option>
                    <option value="inline">Inline</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Actif</FormLabel>
                  <HStack pt={2}>
                    <Switch
                      isChecked={form.enabled}
                      onChange={(e) => setForm((s) => ({ ...s, enabled: e.target.checked }))}
                    />
                    <Text fontSize="sm" color="gray.600">
                      {form.enabled ? "Enabled" : "Disabled"}
                    </Text>
                  </HStack>
                </FormControl>
              </SimpleGrid>

              {form.provider === "adsense" ? (
                <Card>
                  <CardBody>
                    <Text fontWeight="semibold" mb={3}>
                      Configuration AdSense
                    </Text>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Client ID</FormLabel>
                        <Input
                          value={form.adsenseClientId}
                          onChange={(e) => setForm((s) => ({ ...s, adsenseClientId: e.target.value }))}
                          placeholder="ca-pub-xxxxxxxxxxxx"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Slot ID</FormLabel>
                        <Input
                          value={form.adsenseSlotId}
                          onChange={(e) => setForm((s) => ({ ...s, adsenseSlotId: e.target.value }))}
                          placeholder="1234567890"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Format</FormLabel>
                        <Input
                          value={form.adsenseFormat}
                          onChange={(e) => setForm((s) => ({ ...s, adsenseFormat: e.target.value }))}
                          placeholder="auto"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Responsive</FormLabel>
                        <HStack pt={2}>
                          <Switch
                            isChecked={form.adsenseResponsive}
                            onChange={(e) => setForm((s) => ({ ...s, adsenseResponsive: e.target.checked }))}
                          />
                          <Text fontSize="sm" color="gray.600">
                            {form.adsenseResponsive ? "Oui" : "Non"}
                          </Text>
                        </HStack>
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>
              ) : null}

              {form.provider === "gam" ? (
                <Card>
                  <CardBody>
                    <Text fontWeight="semibold" mb={3}>
                      Configuration Google Ad Manager (GPT)
                    </Text>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Network Code</FormLabel>
                        <Input
                          value={form.gamNetworkCode}
                          onChange={(e) => setForm((s) => ({ ...s, gamNetworkCode: e.target.value }))}
                          placeholder="ex: 1234567"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Ad Unit Path</FormLabel>
                        <Input
                          value={form.gamAdUnitPath}
                          onChange={(e) => setForm((s) => ({ ...s, gamAdUnitPath: e.target.value }))}
                          placeholder='ex: /1234567/home_sidebar_top'
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Sizes</FormLabel>
                        <Input
                          value={form.gamSizesText}
                          onChange={(e) => setForm((s) => ({ ...s, gamSizesText: e.target.value }))}
                          placeholder="ex: 300x250, 300x600"
                        />
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          Format: <Badge variant="subtle">WxH</Badge> séparés par des virgules.
                        </Text>
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>
              ) : null}

              {form.provider === "manual" ? (
                <Card>
                  <CardBody>
                    <Text fontWeight="semibold" mb={1}>
                      Manual
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Cet emplacement sert uniquement à diffuser une publicité interne (sans config Google).
                    </Text>
                  </CardBody>
                </Card>
              ) : null}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={saving}>
              Annuler
            </Button>
            <Button colorScheme="teal" onClick={handleSave} isLoading={saving}>
              {selected ? "Mettre à jour" : "Créer"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Supprimer l’emplacement</AlertDialogHeader>
            <AlertDialogBody>
              Êtes-vous sûr de vouloir supprimer <b>{selected?.name}</b> (key: {selected?.key}) ? Cette action est irréversible.
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

export default PlacementDashboard;
