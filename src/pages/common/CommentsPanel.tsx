import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  HStack,
  IconButton,
  Select,
  Skeleton,
  Spacer,
  Stack,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaEye, FaEyeSlash, FaRedo, FaTrash } from "react-icons/fa";
import { apiFetch } from "../../services/api";
import type { CommentDto, CommentStatus, Paged } from "../../types";
import { buildPageItems, formatDateTime, statusColor, statusLabelComment } from "../../utils/utils";

export default function CommentsPanel({ articleId }: { articleId: string }) {
  const toast = useToast();
  const confirm = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [status, setStatus] = useState<CommentStatus>("visible");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [toDelete, setToDelete] = useState<CommentDto | null>(null);

  const [data, setData] = useState<Paged<CommentDto>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });

  const pagesUi = useMemo(() => buildPageItems(data.page, data?.pages || 0), [data.page, data.pages]);

  const load = async (next?: Partial<{ page: number; limit: number; status: CommentStatus }>) => {
    const p = next?.page ?? page;
    const l = next?.limit ?? limit;
    const s = next?.status ?? status;

    setLoading(true);
    try {
      const res = await apiFetch(`/api/articles/${articleId}/comments?page=${p}&limit=${l}&status=${s}`);
      const paged = res as Paged<CommentDto>;

      setData({
        items: Array.isArray(paged.items) ? paged.items : [],
        total: Number(paged.total ?? 0),
        page: Number(paged.page ?? p),
        limit: Number(paged.limit ?? l),
        pages: Math.max(1, Number(paged.pages ?? 1)),
      });
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Impossible de charger les commentaires",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStatus("visible");
    setLimit(10);
    setPage(1);
    load({ page: 1, limit: 10, status: "visible" });
  }, [articleId]);

  useEffect(() => {
    setPage(1);
  }, [status, limit]);

  useEffect(() => {
    load({ page, limit, status });
  }, [page, limit, status]);

  const moderate = async (commentId: string, nextStatus: CommentStatus) => {
    setBusyId(commentId);
    try {
      await apiFetch(`/api/articles/comments/${commentId}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      toast({ title: "Statut mis à jour", status: "success", duration: 1200, isClosable: true });
      await load();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Impossible de modifier le statut",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setBusyId(null);
    }
  };

  const askDelete = (c: CommentDto) => {
    setToDelete(c);
    confirm.onOpen();
  };

  const remove = async () => {
    if (!toDelete) return;
    const commentId = toDelete.id;

    setBusyId(commentId);
    try {
      await apiFetch(`/api/articles/comments/${commentId}`, { method: "DELETE" });
      toast({ title: "Commentaire supprimé", status: "info", duration: 1200, isClosable: true });
      const willEmpty = data.items.length === 1 && data.page > 1;
      const nextPage = willEmpty ? data.page - 1 : data.page;
      confirm.onClose();
      setToDelete(null);
      setPage(nextPage);
      await load({ page: nextPage });
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Suppression impossible",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <VStack align="stretch" spacing={4}>
      {}
      <Card>
        <CardBody>
          <HStack wrap="wrap" spacing={3}>
            <HStack spacing={2}>
              <Text fontWeight="semibold">Commentaires</Text>
              <Badge variant="subtle" colorScheme="teal">
                {data.total}
              </Badge>
            </HStack>

            <Spacer />

            <HStack spacing={3} wrap="wrap">
              <Select
                w={{ base: "full", md: "210px" }}
                value={status}
                onChange={(e) => setStatus(e.target.value as CommentStatus)}
              >
                <option value="visible">Visible</option>
                <option value="pending">En attente</option>
                <option value="hidden">Masqué</option>
              </Select>

              <Select
                w={{ base: "full", md: "150px" }}
                value={String(limit)}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value="10">10 / page</option>
                <option value="20">20 / page</option>
                <option value="50">50 / page</option>
              </Select>

              <Button leftIcon={<FaRedo />} variant="outline" onClick={() => load()} isLoading={loading}>
                Rafraîchir
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      {}
      <Card>
        <CardBody>
          {loading ? (
            <Stack spacing={3}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} borderWidth="1px" borderRadius="2xl" p={4}>
                  <HStack mb={2}>
                    <Skeleton height="28px" width="28px" borderRadius="999px" />
                    <Skeleton height="14px" width="180px" />
                    <Spacer />
                    <Skeleton height="22px" width="90px" borderRadius="999px" />
                  </HStack>
                  <Skeleton height="14px" mb={2} />
                  <Skeleton height="14px" />
                </Box>
              ))}
            </Stack>
          ) : data.items.length === 0 ? (
            <Text color="gray.500">Aucun commentaire.</Text>
          ) : (
            <Stack spacing={4}>
              {data.items.map((c) => {
                const inferredStatus: CommentStatus =
                  status === "pending" ? "pending" : c.isHidden ? "hidden" : "visible";

                const isDeleting = busyId === c.id && !!toDelete && toDelete.id === c.id;

                return (
                  <Box key={c.id} borderWidth="1px" borderRadius="2xl" p={4} bg="white">
                    <HStack align="start" spacing={3}>
                      <Avatar size="sm" name={c.user?.name ?? "User"} src={c.user?.avatar ?? undefined} />

                      <Box flex="1" minW={0}>
                        <HStack spacing={2} wrap="wrap">
                          <Text fontWeight="semibold" noOfLines={1}>
                            {c.user?.name || "Utilisateur"}
                          </Text>

                          {c.user?.email ? (
                            <Text fontSize="sm" color="gray.500" noOfLines={1}>
                              ({c.user.email})
                            </Text>
                          ) : null}

                          <Spacer />

                          <Badge colorScheme={statusColor(inferredStatus)} variant="subtle">
                            {statusLabelComment(inferredStatus)}
                          </Badge>

                          <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                            {formatDateTime(c.createdAt)}
                          </Text>
                        </HStack>

                        <Divider my={3} />

                        <Text whiteSpace="pre-wrap" color="gray.800" fontSize="md" lineHeight="1.7">
                          {c.content}
                        </Text>

                        <HStack mt={4}>
                          <IconButton
                            aria-label="Toggle hidden"
                            icon={c.isHidden ? <FaEye /> : <FaEyeSlash />}
                            variant="outline"
                            colorScheme={c.isHidden ? "green" : "red"}
                            size="sm"
                            isLoading={busyId === c.id && !isDeleting}
                            onClick={() => moderate(c.id, c.isHidden ? "visible" : "hidden")}
                          />
                          <Text fontSize="sm" color="gray.600">
                            {c.isHidden ? "Rendre visible" : "Masquer"}
                          </Text>

                          <Spacer />

                          <IconButton
                            aria-label="Delete"
                            icon={<FaTrash />}
                            colorScheme="red"
                            variant="ghost"
                            size="sm"
                            isLoading={isDeleting}
                            onClick={() => askDelete(c)}
                          />
                        </HStack>
                      </Box>
                    </HStack>
                  </Box>
                );
              })}
            </Stack>
          )}

          {}
          {!loading && data.pages! > 1 ? (
            <Flex mt={6} align="center" justify="center" wrap="wrap" gap={2}>
              <Button size="sm" variant="outline" onClick={() => setPage(1)} isDisabled={data.page <= 1}>
                «
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                isDisabled={data.page <= 1}
              >
                ←
              </Button>

              {pagesUi.map((p, idx) =>
                p === "…" ? (
                  <Box key={`dots-${idx}`} px={2} color="gray.500">
                    …
                  </Box>
                ) : (
                  <Button
                    key={p}
                    size="sm"
                    variant={p === data.page ? "solid" : "outline"}
                    colorScheme={p === data.page ? "teal" : "gray"}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                )
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.min(data.pages!, p + 1))}
                isDisabled={data.page >= data.pages!}
              >
                →
              </Button>

              <Button size="sm" variant="outline" onClick={() => setPage(data.pages!)} isDisabled={data.page >= data.pages!}>
                »
              </Button>
            </Flex>
          ) : null}

          {!loading ? (
            <Text mt={3} fontSize="sm" color="gray.500" textAlign="center">
              Page {data.page} / {data.pages} • {data.total} commentaire(s)
            </Text>
          ) : null}
        </CardBody>
      </Card>

      {}
      <AlertDialog
        isOpen={confirm.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          if (busyId) return;
          confirm.onClose();
          setToDelete(null);
        }}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Supprimer le commentaire
          </AlertDialogHeader>

          <AlertDialogBody>
            Voulez-vous vraiment supprimer ce commentaire ? Cette action est irréversible.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={() => { confirm.onClose(); setToDelete(null); }} isDisabled={!!busyId}>
              Annuler
            </Button>
            <Button colorScheme="red" onClick={remove} ml={3} isLoading={!!busyId}>
              Supprimer
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </VStack>
  );
}
