import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Select,
  Spacer,
  Text,
  Tooltip,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaGripVertical, FaTrash, FaUpload } from "react-icons/fa";
import { articleService, type ArticleMediaDto, type MediaType } from "../../services/articleService";
import { Thumb } from "./Thumb";
import { iconFor } from "./IconFor";

export default function MediaManagerPro({ articleId }: { articleId: string }) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ArticleMediaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [type, setType] = useState<MediaType>("image");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [uploadType, setUploadType] = useState<MediaType>("image");
  const [uploadTitle, setUploadTitle] = useState("");
  const sorted = useMemo(() => {
    const arr = items.slice();
    arr.sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
    return arr;
  }, [items]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await articleService.listMedia(articleId);
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast({ title: "Erreur médias", description: e?.message || "Impossible de charger", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [articleId]);

  const addByUrl = async () => {
    if (!url.trim()) return;

    try {
      const maxPos = Math.max(-1, ...sorted.map((m) => m.position ?? 0));
      await articleService.addMedia(articleId, {
        type,
        url: url.trim(),
        title: title.trim() || undefined,
        position: maxPos + 1,
      });
      setUrl("");
      setTitle("");
      await load();
      toast({ title: "Média ajouté", status: "success", duration: 1200 });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message || "Ajout impossible", status: "error" });
    }
  };

  const upload = async (file: File) => {
    try {
      await articleService.uploadMedia(articleId, file, {
        type: uploadType,
        title: uploadTitle.trim() || undefined,
      });
      setUploadTitle("");
      if (fileRef.current) fileRef.current.value = "";
      await load();
      toast({ title: "Upload OK", status: "success", duration: 1200 });
    } catch (e: any) {
      toast({ title: "Erreur upload", description: e?.message || "Upload impossible", status: "error" });
    }
  };

  const remove = async (id: string) => {
    setBusyId(id);
    try {
      await articleService.removeMedia(id);
      await load();
      toast({ title: "Supprimé", status: "info", duration: 1000 });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message || "Suppression impossible", status: "error" });
    } finally {
      setBusyId(null);
    }
  };

  /* ============ Drag & Drop reorder (HTML5) ============ */
  const [dragId, setDragId] = useState<string | null>(null);

  const onDropReorder = async (targetId: string) => {
    if (!dragId || dragId === targetId) return;

    const list = sorted.slice();
    const from = list.findIndex((x) => x.id === dragId);
    const to = list.findIndex((x) => x.id === targetId);
    if (from < 0 || to < 0) return;

    const moved = list.splice(from, 1)[0];
    list.splice(to, 0, moved);

    const next = list.map((m, idx) => ({ ...m, position: idx }));
    setItems(next);

    try {
      const ops = next
        .filter((m) => (items.find((x) => x.id === m.id)?.position ?? 0) !== m.position)
        .map((m) => articleService.reorderMedia(m.id, { position: m.position ?? 0 }));

      await Promise.all(ops);
      toast({ title: "Ordre mis à jour", status: "success", duration: 900 });
      await load();
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message || "Réorganisation impossible", status: "error" });
      await load();
    } finally {
      setDragId(null);
    }
  };

  return (
    <VStack align="stretch" spacing={4}>
      {/* Add by URL */}
      <Card>
        <CardBody>
          <HStack mb={3}>
            <Text fontWeight="semibold">Ajouter un média (URL)</Text>
            <Spacer />
            <Badge variant="subtle" colorScheme="teal">
              Galerie
            </Badge>
          </HStack>

          <HStack align="end" spacing={3} wrap="wrap">
            <FormControl maxW="220px">
              <FormLabel>Type</FormLabel>
              <Select value={type} onChange={(e) => setType(e.target.value as MediaType)}>
                <option value="image">Image</option>
                <option value="video">Vidéo (iframe URL)</option>
                <option value="pdf">PDF</option>
              </Select>
            </FormControl>

            <FormControl flex="1" minW="260px">
              <FormLabel>URL</FormLabel>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </FormControl>

            <FormControl flex="1" minW="220px">
              <FormLabel>Titre</FormLabel>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optionnel" />
            </FormControl>

            <Button colorScheme="teal" onClick={addByUrl} isDisabled={!url.trim()}>
              Ajouter
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Upload */}
      <Card>
        <CardBody>
          <HStack mb={3}>
            <Text fontWeight="semibold">Uploader un fichier</Text>
            <Spacer />
            <Badge variant="subtle">/uploads/articles</Badge>
          </HStack>

          <HStack align="end" spacing={3} wrap="wrap">
            <FormControl maxW="220px">
              <FormLabel>Type</FormLabel>
              <Select value={uploadType} onChange={(e) => setUploadType(e.target.value as MediaType)}>
                <option value="image">Image</option>
                <option value="video">Vidéo</option>
                <option value="pdf">PDF</option>
              </Select>
            </FormControl>

            <FormControl flex="1" minW="240px">
              <FormLabel>Titre</FormLabel>
              <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Optionnel" />
            </FormControl>

            <Input
              ref={fileRef}
              type="file"
              display="none"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
              }}
            />

            <Button leftIcon={<FaUpload />} variant="outline" onClick={() => fileRef.current?.click()}>
              Choisir un fichier
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* List + DnD */}
      <Card>
        <CardBody>
          <HStack mb={3}>
            <Text fontWeight="semibold">Médias ({sorted.length})</Text>
            <Spacer />
            <Text fontSize="sm" color="gray.500">
              {loading ? "Chargement..." : "Drag & drop pour réordonner"}
            </Text>
          </HStack>

          {sorted.length === 0 ? (
            <Text color="gray.500">Aucun média.</Text>
          ) : (
            <VStack align="stretch" spacing={2}>
              {sorted.map((m) => (
                <Box
                  key={m.id}
                  borderWidth="1px"
                  borderRadius="2xl"
                  p={3}
                  bg={dragId === m.id ? "teal.50" : "white"}
                  draggable
                  onDragStart={() => setDragId(m.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDropReorder(m.id)}
                >
                  <HStack spacing={3} align="center">
                    <Tooltip label="Glisser pour réordonner">
                      <Box color="gray.400" cursor="grab">
                        <FaGripVertical />
                      </Box>
                    </Tooltip>

                    <Thumb item={m} />

                    <Box flex="1" minW={0}>
                      <HStack spacing={2}>
                        <Box color="gray.600">{iconFor(m.type)}</Box>
                        <Text fontWeight="semibold" noOfLines={1}>
                          {m.title || m.url}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500" noOfLines={1} mt={1}>
                        {m.url}
                      </Text>
                    </Box>

                    <IconButton
                      aria-label="Delete"
                      icon={<FaTrash />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      isLoading={busyId === m.id}
                      onClick={() => remove(m.id)}
                    />
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
}
