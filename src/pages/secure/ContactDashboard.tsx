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
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  Select,
  VStack,
} from "@chakra-ui/react";
import { FaRedo, FaSearch } from "react-icons/fa";
import { contactService } from "../../services/contactService";
import type { ContactDto, Paginated } from "../../types";
import ContactTable from "../ui/ContactTable";
import FilterBar from "../ui/FilterBar";
import { useResetPaginationOnChange } from "../../hooks/useResetPaginationOnChange";
import { useClampPagination } from "../../hooks/useClampPagination";
import { normalize, toDateLabel } from "../../utils/utils";
import type { ContactRow } from "../../types";

export default function ContactDashboard() {
  const toast = useToast();

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const muted = useColorModeValue("gray.600", "gray.300");

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContactRow | null>(null);
  const details = useDisclosure();

  const [tab, setTab] = useState<"all" | "unread">("all");

  const [q, setQ] = useState("");
  const [filterState, setFilterState] = useState<"all" | "read" | "unread" | "archived">("all");

  const [pageAll, setPageAll] = useState(1);
  const [pageUnread, setPageUnread] = useState(1);
  const limit = 25;

  const [all, setAll] = useState<Paginated<ContactDto> | null>(null);
  const [unread, setUnread] = useState<Paginated<ContactDto> | null>(null);

  useResetPaginationOnChange([q, filterState], () => {
    setPageAll(1);
    setPageUnread(1);
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, unreadRes] = await Promise.all([
        contactService.getContacts({ page: pageAll, limit, unread: false }).catch(() => null),
        contactService.getContacts({ page: pageUnread, limit, unread: true }).catch(() => null),
      ]);

      if (allRes) setAll(allRes);
      if (unreadRes) setUnread(unreadRes);
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
  }, [toast, pageAll, pageUnread]);

  useEffect(() => {
    load();
  }, [load]);

  const pagesAll = all?.totalPages ?? 1;
  const pagesUnread = unread?.totalPages ?? 1;
  useClampPagination(pagesAll, setPageAll);
  useClampPagination(pagesUnread, setPageUnread);

  const toRow = (c: ContactDto): ContactRow => ({
    id: c.id,
    name: c.name,
    email: c.email,
    subject: c.subject ?? null,
    message: c.message,
    isRead: c.isRead,
    archivedAt: c.archivedAt ?? null,
    createdAt: c.createdAt,
  });

  const filterRows = useCallback(
    (rows: ContactRow[]) => {
      const t = normalize(q);

      return rows.filter((r) => {
        const name = normalize(String(r.name ?? ""));
        const email = normalize(String(r.email ?? ""));
        const subject = normalize(String(r.subject ?? ""));
        const message = normalize(String(r.message ?? ""));
        const state = normalize(r.archivedAt ? "archived" : r.isRead ? "read" : "unread");

        const matchesSearch =
          !t || name.includes(t) || email.includes(t) || subject.includes(t) || message.includes(t) || state.includes(t);

        const matchesState =
          filterState === "all"
            ? true
            : filterState === "archived"
              ? Boolean(r.archivedAt)
              : filterState === "read"
                ? !r.archivedAt && r.isRead
                : !r.archivedAt && !r.isRead;

        return matchesSearch && matchesState;
      });
    },
    [q, filterState]
  );

  const allRows = useMemo(() => filterRows((all?.data ?? []).map(toRow)), [all, filterRows]);
  const unreadRows = useMemo(() => filterRows((unread?.data ?? []).map(toRow)), [unread, filterRows]);

  const unreadTotal = unread?.total ?? 0;

  const toastOk = (title: string) => toast({ title, status: "success", duration: 2200, isClosable: true });
  const toastInfo = (title: string) => toast({ title, status: "info", duration: 2200, isClosable: true });
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

  const onMarkRead = (row: ContactRow) =>
    withBusy(row.id, async () => {
      await contactService.markContactAsRead(row.id);
      toastOk("Marqué comme lu");
      await load();
    });

  const onMarkUnread = (row: ContactRow) =>
    withBusy(row.id, async () => {
      await contactService.markContactAsUnread(row.id);
      toastInfo("Marqué comme non lu");
      await load();
    });

  const onDelete = (row: ContactRow) =>
    withBusy(row.id, async () => {
      if (!window.confirm("Supprimer ce message ?")) return;
      await contactService.deleteContact(row.id);
      toastOk("Supprimé");
      await load();
    });

  const openDetails = (row: ContactRow) => {
    setSelected(row);
    details.onOpen();
  };

  const closeDetails = () => {
    details.onClose();
    if (selected && !selected.isRead && !selected.archivedAt) {
      const id = selected.id;
      setSelected((prev) => (prev ? { ...prev, isRead: true } : prev));
      withBusy(id, async () => {
        await contactService.markContactAsRead(id);
        await load();
      });
    }
  };

  return (
    <Box bg={pageBg} minH="calc(100vh - 120px)" p={{ base: 4, md: 6 }}>
      <Box maxW="7xl" mx="auto">
        <Card bg={cardBg} borderWidth="1px" borderColor={border} rounded="2xl">
          <CardBody>
            <Flex justify="space-between" align={{ base: "start", md: "center" }} wrap="wrap" gap={4}>
              <Box>
                <Heading size="lg">Contact Dashboard</Heading>
                <Text mt={1} color={muted}>
                  Messages de contact
                </Text>
              </Box>

              <HStack>
                <Button leftIcon={<FaRedo />} variant="outline" onClick={load} isDisabled={loading}>
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
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (nom, email, sujet, message)…" />
                </InputGroup>
              }
              right={
                <Select maxW="220px" value={filterState} onChange={(e) => setFilterState(e.target.value as any)}>
                  <option value="all">Tous les états</option>
                  <option value="unread">Non lus</option>
                  <option value="read">Lus</option>
                  <option value="archived">Archivés</option>
                </Select>
              }
            />

            <Tabs
              isFitted
              variant="enclosed"
              colorScheme="teal"
              index={tab === "all" ? 0 : 1}
              onChange={(i) => setTab(i === 0 ? "all" : "unread")}
            >
              <TabList mb="1em">
                <Tab>Toutes</Tab>
                <Tab>
                  Non lus{" "}
                  {unreadTotal > 0 ? (
                    <Badge ml={2} colorScheme="red" borderRadius="full">
                      {unreadTotal}
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
                      <ContactTable mode="all" rows={allRows} busyId={busyId} onRowClick={openDetails} onMarkRead={onMarkRead} onMarkUnread={onMarkUnread} onDelete={onDelete} />
                    </Box>
                  )}
                </TabPanel>

                <TabPanel p={0}>
                  {loading ? (
                    <Flex py={10} justify="center">
                      <Spinner />
                    </Flex>
                  ) : (
                    <Box overflowX="auto">
                      <ContactTable mode="unread" rows={unreadRows} busyId={busyId} onRowClick={openDetails} onMarkRead={onMarkRead} onMarkUnread={onMarkUnread} onDelete={onDelete} />
                    </Box>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>

            <Divider my={5} />
            <Flex justify="space-between" align="center" color={muted} fontSize="sm" wrap="wrap" gap={3}>
              <Text>
                Page (Toutes) : {all?.page ?? pageAll} / {all?.totalPages ?? "—"}
              </Text>
              <HStack>
                <Button size="sm" onClick={() => setPageAll((p) => Math.max(1, p - 1))} isDisabled={(all?.page ?? 1) <= 1}>
                  Précédent
                </Button>
                <Button size="sm" onClick={() => setPageAll((p) => p + 1)} isDisabled={all ? all.page >= (all.totalPages ?? 1) : false}>
                  Suivant
                </Button>
              </HStack>

              <Text>
                Page (Non lus) : {unread?.page ?? pageUnread} / {unread?.totalPages ?? "—"}
              </Text>
              <HStack>
                <Button size="sm" onClick={() => setPageUnread((p) => Math.max(1, p - 1))} isDisabled={(unread?.page ?? 1) <= 1}>
                  Précédent
                </Button>
                <Button size="sm" onClick={() => setPageUnread((p) => p + 1)} isDisabled={unread ? unread.page >= (unread.totalPages ?? 1) : false}>
                  Suivant
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
      </Box>

      <Modal isOpen={details.isOpen} onClose={closeDetails} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Details du message</ModalHeader>
          <ModalCloseButton />
    <ModalBody>
      {selected ? (
        <VStack align="start" spacing={3}>
          <Box>
            <Text fontWeight="semibold">{selected.name || "N/A"}</Text>
            <Text color="gray.600">{selected.email || "N/A"}</Text>
          </Box>

          <Box>
            <Text fontSize="sm" color="gray.500">Sujet</Text>
            <Text>{selected.subject || "N/A"}</Text>
          </Box>

          <Box>
            <Text fontSize="sm" color="gray.500">Message</Text>
            <Text whiteSpace="pre-wrap">{selected.message || "N/A"}</Text>
          </Box>

          <HStack>
            {selected.archivedAt ? (
              <Badge colorScheme="purple">Archive</Badge>
            ) : selected.isRead ? (
              <Badge colorScheme="green">Lu</Badge>
            ) : (
              <Badge colorScheme="red">Non lu</Badge>
            )}
            <Text fontSize="sm" color="gray.500">
              {toDateLabel(selected.createdAt ?? null)}
            </Text>
          </HStack>

          {selected.archivedAt ? (
            <Text fontSize="sm" color="gray.500">
              Archive le {toDateLabel(selected.archivedAt)}
            </Text>
          ) : null}
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
    </Box>
  );
}

