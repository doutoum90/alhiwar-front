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
    InputGroup,
    InputLeftElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useColorModeValue,
    useDisclosure,
    useToast,
    Select,
    SimpleGrid,
    VStack,
} from "@chakra-ui/react";
import { FaRedo, FaSearch } from "react-icons/fa";
import { newsletterService } from "../../services/newsletterService";
import type { NewsletterSubscriberDto, Paginated } from "../../types";
import NewsletterTable from "../ui/NewsletterTable";
import FilterBar from "../ui/FilterBar";
import { useResetPaginationOnChange } from "../../hooks/useResetPaginationOnChange";
import { useClampPagination } from "../../hooks/useClampPagination";
import { normalize, toDateLabel } from "../../utils/utils";
import type { NewsletterRow } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

export default function NewsletterAdmin() {
    const toast = useToast();
    const details = useDisclosure();
    const { user } = useAuth();
    const isPrivileged = useMemo(() => {
        const role = normalize(user?.role ?? "");
        const roles = (user?.roles ?? []).map((r) => normalize(r));
        return role === "admin" || role === "editor" || roles.includes("admin") || roles.includes("editor");
    }, [user]);

    const pageBg = useColorModeValue("gray.50", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");
    const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
    const muted = useColorModeValue("gray.600", "gray.300");

    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [selected, setSelected] = useState<NewsletterRow | null>(null);

    const [tab, setTab] = useState<"all" | "unverified">("all");

    const [q, setQ] = useState("");
    const [pageAll, setPageAll] = useState(1);
    const [pageUnverified, setPageUnverified] = useState(1);
    const limit = 25;

    const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "unverified">("all");
    const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

    const [all, setAll] = useState<Paginated<NewsletterSubscriberDto> | null>(null);
    const [allUnverifiedCount, setAllUnverifiedCount] = useState(0);

    useResetPaginationOnChange([q, filterVerified, filterActive], () => {
        setPageAll(1);
        setPageUnverified(1);
    });

    const toRow = (s: NewsletterSubscriberDto): NewsletterRow => ({
        id: s.id,
        email: s.email,
        isActive: Boolean(s.isActive),
        isVerified: Boolean(s.isVerified),
        createdAt: s.createdAt ?? null,
    });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            if (!isPrivileged) {
                setAll({ items: [], total: 0, page: 1, limit, pages: 1 } as any);
                setAllUnverifiedCount(0);
                return;
            }
            const params = new URLSearchParams();
            params.set("page", String(pageAll));
            params.set("limit", String(limit));
            if (q.trim()) params.set("q", q.trim());

            const res = await newsletterService.getSubscribers(params);
            setAll(res);

            const unverifiedCountOnPage = (res.items ?? []).filter((x) => !x.isVerified).length;
            setAllUnverifiedCount(unverifiedCountOnPage);
        } catch (e: any) {
            toast({
                title: "Erreur",
                description: e?.message || "Impossible de charger la newsletter.",
                status: "error",
                duration: 3500,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    }, [toast, q, pageAll, isPrivileged]);

    useEffect(() => {
        load();
    }, [load]);

    const pagesAll = all?.pages ?? 1;
    useClampPagination(pagesAll, setPageAll);

    const filterLocal = useCallback(
        (rows: NewsletterRow[]) => {
            const t = normalize(q);

            return rows.filter((r) => {
                const matchesSearch = !t || normalize(r.email).includes(t);

                const matchesVerified =
                    filterVerified === "all" ? true : filterVerified === "verified" ? r.isVerified : !r.isVerified;

                const matchesActive =
                    filterActive === "all" ? true : filterActive === "active" ? r.isActive : !r.isActive;

                return matchesSearch && matchesVerified && matchesActive;
            });
        },
        [q, filterVerified, filterActive]
    );

    const allRows = useMemo(() => filterLocal((all?.items ?? []).map(toRow)), [all, filterLocal]);

    const unverifiedRowsAll = useMemo(() => allRows.filter((r) => !r.isVerified), [allRows]);

    const unverifiedRows = useMemo(() => {
        const start = (pageUnverified - 1) * limit;
        return unverifiedRowsAll.slice(start, start + limit);
    }, [unverifiedRowsAll, pageUnverified]);

    const unverifiedPages = Math.max(1, Math.ceil(unverifiedRowsAll.length / limit));

    useClampPagination(unverifiedPages, setPageUnverified);

    const toastOk = (title: string) => toast({ title, status: "success", duration: 2000, isClosable: true });
    const toastErr = (title: string, e: any) =>
        toast({ title, description: e?.message || "Erreur", status: "error", duration: 3500, isClosable: true });

    const withBusy = (id: string, fn: () => Promise<void>) => {
        (async () => {
            try {
                setBusyId(id);
                await fn();
            } catch (e) {
                toastErr("Action impossible", e);
            } finally {
                setBusyId(null);
            }
        })();
    };

    const onToggleActive = (row: NewsletterRow, value: boolean) =>
        withBusy(row.id, async () => {
            await newsletterService.updateSubscriber(row.id, { isActive: value });
            toastOk("Mis à jour");
            await load();
        });

    const onToggleVerified = (row: NewsletterRow, value: boolean) =>
        withBusy(row.id, async () => {
            await newsletterService.updateSubscriber(row.id, { isVerified: value });
            toastOk("Mis à jour");
            await load();
        });

    const onDelete = (row: NewsletterRow) =>
        withBusy(row.id, async () => {
            if (!window.confirm("Supprimer cet abonnǸ ?")) return;
            await newsletterService.deleteSubscriber(row.id);
            toastOk("SupprimǸ");
            await load();
        });

    const openDetails = (row: NewsletterRow) => {
        setSelected(row);
        details.onOpen();
    };

    const closeDetails = () => {
        setSelected(null);
        details.onClose();
    };

    return (
        <Box bg={pageBg} minH="calc(100vh - 120px)" p={{ base: 4, md: 6 }}>
            <Box maxW="7xl" mx="auto">
                <Card bg={cardBg} borderWidth="1px" borderColor={border} rounded="2xl">
                    <CardBody>
                        <Flex justify="space-between" align={{ base: "start", md: "center" }} wrap="wrap" gap={4}>
                            <Box>
                                <Heading size="lg">Newsletter</Heading>
                                <Text mt={1} color={muted}>
                                    Administration des abonnés
                                </Text>
                            </Box>

                            <HStack>
                                <Button leftIcon={<FaRedo />} variant="outline" onClick={load} isDisabled={loading || !isPrivileged}>
                                    Rafraîchir
                                </Button>
                            </HStack>
                        </Flex>

                        <Divider my={5} />

                        <FilterBar
                            mb={5}
                            left={
                                <InputGroup w={{ base: "full", md: "520px" }}>
                                    <InputLeftElement>
                                        <FaSearch />
                                    </InputLeftElement>
                                    <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (email)…" />
                                </InputGroup>
                            }
                            right={
                                <SimpleGrid
                                    columns={{ base: 2, md: 2 }}
                                    spacing={3}
                                    minW={{ base: "full", md: "auto" }}
                                    w={{ base: "full", md: "auto" }}
                                >
                                    <Select value={filterVerified} onChange={(e) => setFilterVerified(e.target.value as any)}>
                                        <option value="all">Tous</option>
                                        <option value="verified">Vérifiés</option>
                                        <option value="unverified">Non vérifiés</option>
                                    </Select>

                                    <Select value={filterActive} onChange={(e) => setFilterActive(e.target.value as any)}>
                                        <option value="all">Tous</option>
                                        <option value="active">Actifs</option>
                                        <option value="inactive">Inactifs</option>
                                    </Select>
                                </SimpleGrid>
                            }
                        />

                        <Tabs
                            isFitted
                            variant="enclosed"
                            colorScheme="teal"
                            index={tab === "all" ? 0 : 1}
                            onChange={(i) => setTab(i === 0 ? "all" : "unverified")}
                        >
                            <TabList mb="1em">
                                <Tab>Tous</Tab>
                                <Tab>
                                    Non vérifiés{" "}
                                    {allUnverifiedCount > 0 ? (
                                        <Badge ml={2} colorScheme="red" borderRadius="full">
                                            {allUnverifiedCount}
                                        </Badge>
                                    ) : null}
                                </Tab>
                            </TabList>

                            <TabPanels>
                                <TabPanel p={0}>
                                    {loading ? (
                                        <Flex py={10} justify="center">
                                            <Spinner />
                                        </Flex>
                                    ) : (
                                        <Box overflowX="auto">
                                            <NewsletterTable
                                                mode="all"
                                                rows={allRows}
                                                busyId={busyId}
                                                onRowClick={openDetails}
                                                onToggleActive={isPrivileged ? onToggleActive : undefined}
                                                onToggleVerified={isPrivileged ? onToggleVerified : undefined}
                                                onDelete={isPrivileged ? onDelete : undefined}
                                            />
                                        </Box>
                                    )}

                                    <Divider my={5} />
                                    <Flex justify="space-between" align="center" color={muted} fontSize="sm" wrap="wrap" gap={3}>
                                        <Text>
                                            Page : {all?.page ?? pageAll} / {all?.pages ?? "—"} • Total : {all?.total ?? "—"}
                                        </Text>
                                        <HStack>
                                            <Button size="sm" onClick={() => setPageAll((p) => Math.max(1, p - 1))} isDisabled={(all?.page ?? 1) <= 1}>
                                                Précédent
                                            </Button>
                                            <Button size="sm" onClick={() => setPageAll((p) => p + 1)} isDisabled={all ? all.page >= (all.pages || 0) : false}>
                                                Suivant
                                            </Button>
                                        </HStack>
                                    </Flex>
                                </TabPanel>

                                <TabPanel p={0}>
                                    {loading ? (
                                        <Flex py={10} justify="center">
                                            <Spinner />
                                        </Flex>
                                    ) : (
                                        <Box overflowX="auto">
                                            <NewsletterTable
                                                mode="unverified"
                                                rows={unverifiedRows}
                                                busyId={busyId}
                                                onRowClick={openDetails}
                                                onToggleActive={isPrivileged ? onToggleActive : undefined}
                                                onToggleVerified={isPrivileged ? onToggleVerified : undefined}
                                                onDelete={isPrivileged ? onDelete : undefined}
                                            />
                                        </Box>
                                    )}

                                    <Divider my={5} />
                                    <Flex justify="space-between" align="center" color={muted} fontSize="sm" wrap="wrap" gap={3}>
                                        <Text>
                                            Page : {pageUnverified} / {unverifiedPages} • Non vérifiés (sur données chargées) : {unverifiedRowsAll.length}
                                        </Text>
                                        <HStack>
                                            <Button size="sm" onClick={() => setPageUnverified((p) => Math.max(1, p - 1))} isDisabled={pageUnverified <= 1}>
                                                Précédent
                                            </Button>
                                            <Button size="sm" onClick={() => setPageUnverified((p) => p + 1)} isDisabled={pageUnverified >= unverifiedPages}>
                                                Suivant
                                            </Button>
                                        </HStack>
                                    </Flex>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>

                        <Modal isOpen={details.isOpen} onClose={closeDetails} size="md">
                            <ModalOverlay />
                            <ModalContent>
                                <ModalHeader>Details abonnement</ModalHeader>
                                <ModalCloseButton />
                                <ModalBody>
                                    {selected ? (
                                        <VStack align="start" spacing={3}>
                                            <Box>
                                                <Text fontWeight="semibold">{selected.email || "N/A"}</Text>
                                                <Text fontSize="sm" color="gray.500">
                                                    {toDateLabel(selected.createdAt ?? null)}
                                                </Text>
                                            </Box>

                                            <HStack>
                                                <Badge colorScheme={selected.isActive ? "green" : "gray"}>
                                                    {selected.isActive ? "Actif" : "Inactif"}
                                                </Badge>
                                                <Badge colorScheme={selected.isVerified ? "green" : "red"}>
                                                    {selected.isVerified ? "Verifie" : "Non verifie"}
                                                </Badge>
                                            </HStack>
                                        </VStack>
                                    ) : null}
                                </ModalBody>
                                <ModalFooter>
                                    <Button variant="ghost" onClick={closeDetails}>
                                        Fermer
                                    </Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
}


