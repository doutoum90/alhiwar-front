import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Spacer,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { articleService } from "../../services/articleService";
import type { UserMiniDto } from "../../types";
import { usersService } from "../../services/userService";
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import type { Link } from "../../types";
import { buildPageItems, normalizePaged } from "../../utils/pagination";
import { uniqById } from "../../utils/utils";
import { SelectedAuthorRow } from "./SelectedAuthorRow";

export default function AuthorsPicker({ articleId }: { articleId: string }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [searchLimit] = useState(10);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchItems, setSearchItems] = useState<UserMiniDto[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selected, setSelected] = useState<UserMiniDto[]>([]);
  const debounceRef = useRef<number | null>(null);
  const resultsTopRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const pages = useMemo(() => Math.max(1, Math.ceil(searchTotal / searchLimit)), [searchTotal, searchLimit]);
  const pagesUi = useMemo(() => buildPageItems(searchPage, pages), [searchPage, pages]);
  const selectedIds = useMemo(() => new Set(selected.map((u) => u.id)), [selected]);
  const scrollResultsToTop = () => {
    resultsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const loadSelectedAuthors = async () => {
    setLoading(true);
    try {
      const links = (await articleService.getAuthors(articleId)) as Link[];

      const main = (links || []).find((l) => l.isMain)?.user ?? null;
      const others = (links || [])
        .map((l) => l.user)
        .filter(Boolean)
        .filter((u) => u?.id && u.id !== main?.id);

      setSelected(main ? [main, ...others] : others);
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Impossible de charger les auteurs",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSearch = async (q: string, p = 1) => {
    const qq = q.trim();
    if (!qq) {
      setSearchItems([]);
      setSearchTotal(0);
      setSearchPage(1);
      setActiveIndex(-1);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await usersService.searchUsers(qq, { page: p, limit: searchLimit });
      const paged = normalizePaged<UserMiniDto>(res, p, searchLimit);
      setSearchItems(Array.isArray(paged.items) ? paged.items : []);
      setSearchTotal(Number.isFinite(paged.total) ? paged.total : 0);
      setSearchPage(paged.page || p);
      setActiveIndex(paged.items?.length ? 0 : -1);

      setTimeout(scrollResultsToTop, 0);
    } catch {
      setSearchItems([]);
      setSearchTotal(0);
      setActiveIndex(-1);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    loadSelectedAuthors();
  }, [articleId]);

  useEffect(() => {
    const q = query.trim();
    setSearchPage(1);

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      loadSearch(q, 1);
    }, 250);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    loadSearch(q, searchPage);
  }, [searchPage]);

  const add = (u: UserMiniDto) => {
    if (!u?.id) return;
    if (selectedIds.has(u.id)) return;
    setSelected((prev) => uniqById([...prev, u]));
  };

  const remove = (userId: string) => {
    setSelected((prev) => prev.filter((u) => u.id !== userId));
  };

  const makeMain = (userId: string) => {
    setSelected((prev) => {
      const idx = prev.findIndex((u) => u.id === userId);
      if (idx <= 0) return prev;
      const copy = prev.slice();
      const [u] = copy.splice(idx, 1);
      copy.unshift(u);
      return copy;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await articleService.setAuthors(articleId, { authorIds: selected.map((u) => u.id) });
      toast({ title: "Auteurs enregistrés", status: "success", duration: 1200, isClosable: true });
      await loadSelectedAuthors();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Enregistrement impossible",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };


  const onKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!query.trim()) return;
    if (searchLoading) return;
    if (!searchItems.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(searchItems.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const u = searchItems[activeIndex];
      if (u) add(u);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setQuery("");
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };


  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSelected((prev) => {
      const oldIndex = prev.findIndex((x) => x.id === active.id);
      const newIndex = prev.findIndex((x) => x.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  return (
    <VStack align="stretch" spacing={4}>
      <Card>
        <CardBody>
          <HStack>
            <Text fontWeight="semibold">Auteurs</Text>
            <Badge variant="subtle" colorScheme="teal">
              {selected.length}
            </Badge>
            <Spacer />
            <Button colorScheme="teal" onClick={save} isLoading={saving} isDisabled={loading}>
              Enregistrer
            </Button>
          </HStack>

          <Text fontSize="sm" color="gray.500" mt={2}>
            Le premier auteur est l’<b>auteur principal</b> (main author).
          </Text>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <InputGroup>
            <InputLeftElement>
              <FaSearch color="gray" />
            </InputLeftElement>
            <Input
              ref={inputRef}
              placeholder="Rechercher un utilisateur (nom / email)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDownSearch}
            />
          </InputGroup>

          {query.trim() ? (
            <Box mt={3}>
              <Box ref={resultsTopRef} />

              {searchLoading ? (
                <Text color="gray.500">Recherche...</Text>
              ) : searchItems.length === 0 ? (
                <Text color="gray.500">Aucun résultat.</Text>
              ) : (
                <Box borderWidth="1px" borderRadius="xl" overflow="hidden">
                  {searchItems.map((u, idx) => {
                    const already = selectedIds.has(u.id);
                    const isActive = idx === activeIndex;

                    return (
                      <Flex
                        key={u.id}
                        px={3}
                        py={2}
                        align="center"
                        borderBottomWidth="1px"
                        _last={{ borderBottomWidth: 0 }}
                        bg={isActive ? "teal.50" : already ? "gray.50" : "white"}
                      >
                        <Avatar size="sm" name={u.name ?? (u as any).username} src={u.avatar ?? undefined} mr={3} />
                        <Box flex="1" minW={0}>
                          <HStack spacing={2}>
                            <Text fontWeight="semibold" noOfLines={1}>
                              {u.name ?? (u as any).username ?? "Utilisateur"}
                            </Text>

                            {already ? (
                              <Badge colorScheme="purple" variant="subtle">
                                Déjà auteur
                              </Badge>
                            ) : null}
                          </HStack>

                          <Text fontSize="sm" color="gray.500" noOfLines={1}>
                            {u.email || "—"}
                          </Text>
                        </Box>

                        <Button size="sm" onClick={() => add(u)} isDisabled={already}>
                          {already ? "Ajouté" : "Ajouter"}
                        </Button>
                      </Flex>
                    );
                  })}
                </Box>
              )}

              {!searchLoading && pages > 1 ? (
                <Flex mt={3} align="center" justify="center" wrap="wrap" gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSearchPage((p) => Math.max(1, p - 1))}
                    isDisabled={searchPage <= 1}
                  >
                    ←
                  </Button>

                  {pagesUi.map((p, idx) =>
                    p.toString() === "…" ? (
                      <Box key={`dots-${idx}`} px={2} color="gray.500">
                        …
                      </Box>
                    ) : (
                      <Button
                        key={p}
                        size="sm"
                        variant={p === searchPage ? "solid" : "outline"}
                        colorScheme={p === searchPage ? "teal" : "gray"}
                        onClick={() => setSearchPage((p as number))}
                      >
                        {p}
                      </Button>
                    )
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSearchPage((p) => Math.min(pages, p + 1))}
                    isDisabled={searchPage >= pages}
                  >
                    →
                  </Button>
                </Flex>
              ) : null}

              {!searchLoading ? (
                <Text mt={2} fontSize="sm" color="gray.500" textAlign="center">
                  Page {searchPage} / {pages} • {searchTotal} résultat(s) — (↑ ↓ Enter / Esc)
                </Text>
              ) : null}
            </Box>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <HStack mb={3}>
            <Text fontWeight="semibold">Sélection</Text>
            <Spacer />
            <Text fontSize="sm" color="gray.500">
              Glisse-dépose pour changer le Main
            </Text>
          </HStack>

          {selected.length === 0 ? (
            <Text color="gray.500">Aucun auteur sélectionné.</Text>
          ) : (
            <DndContext sensors={sensors} onDragEnd={onDragEnd}>
              <SortableContext items={selected.map((u) => u.id)} strategy={verticalListSortingStrategy}>
                <VStack align="stretch" spacing={2}>
                  {selected.map((u, idx) => (
                    <SelectedAuthorRow
                      key={u.id}
                      u={u}
                      idx={idx}
                      onMakeMain={makeMain}
                      onRemove={remove}
                    />
                  ))}
                </VStack>
              </SortableContext>
            </DndContext>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
}
