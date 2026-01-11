
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Spinner,
  Tag,
  TagLabel,
  Text,
  VStack,
  useColorModeValue,
  useToast,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
  AspectRatio,
  SimpleGrid,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaEye,
  FaShareAlt,
  FaCopy,
  FaListUl,
  FaFilePdf,
  FaVideo,
  FaImage,
  FaExternalLinkAlt,
} from "react-icons/fa";

import { articleService } from "../services/articleService";
import { abs } from "../utils/url";
import { newspaperPattern } from "../shared/article/publicUi";
import type { ArticleDto, ArticleMediaDto, CommentDto, DisplayAuthor, Paged, TocItem } from "../types";
import { formatDate, formatDateTime } from "../utils/date";
import { buildPageItems, normalizePaged } from "../utils/pagination";
import { isValidEmail } from "../utils/validation";

const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);



const safeNumber = (n: unknown, fallback = 0) => {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
};


const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const buildTocAndInjectIds = (html: string) => {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  const used = new Map<string, number>();
  const toc: TocItem[] = [];

  const headings = Array.from(doc.querySelectorAll("h2, h3")) as HTMLElement[];

  for (const h of headings) {
    const level = h.tagName.toLowerCase() === "h2" ? 2 : 3;
    const text = (h.textContent || "").trim();
    if (!text) continue;

    const base0 = slugify(text) || "section";
    const count = (used.get(base0) ?? 0) + 1;
    used.set(base0, count);
    const id = count === 1 ? base0 : `${base0}-${count}`;

    h.id = id;
    toc.push({ id, text, level });
  }

  return { htmlWithIds: doc.body.innerHTML, toc };
};

const stripHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
};

const estimateReadingMinutes = (text: string) => {
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const mins = Math.max(1, Math.round(words / 200));
  return { words, mins };
};

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 90;
  window.scrollTo({ top: y, behavior: "smooth" });
};





const ArticleHtml = ({ html }: { html: string }) => {
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const text = useColorModeValue("gray.800", "gray.100");
  const muted = useColorModeValue("gray.600", "gray.300");
  const codeBg = useColorModeValue("blackAlpha.50", "whiteAlpha.100");

  return (
    <Box
      bg={bg}
      borderWidth="1px"
      borderColor={border}
      rounded="2xl"
      p={{ base: 5, md: 8 }}
      color={text}
      sx={{
        "& p": { mb: "1rem", lineHeight: "1.95" },
        "& h1": { fontSize: "2xl", fontWeight: "800", mt: "2.2rem", mb: "1rem" },
        "& h2": { fontSize: "xl", fontWeight: "800", mt: "2.2rem", mb: "1rem" },
        "& h3": { fontSize: "lg", fontWeight: "700", mt: "1.6rem", mb: "0.75rem" },
        "& ul, & ol": { pl: "1.4rem", mb: "1.2rem" },
        "& li": { mb: "0.5rem" },
        "& a": { color: "brand.600", textDecoration: "underline" },
        "& blockquote": {
          borderLeft: "4px solid",
          borderColor: border,
          pl: "1rem",
          color: muted,
          fontStyle: "italic",
          my: "1.25rem",
        },
        "& img": { maxW: "100%", borderRadius: "xl", my: "1.25rem" },
        "& hr": { my: "2rem", borderColor: border },
        "& code": {
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: "0.95em",
          px: "0.35rem",
          py: "0.15rem",
          borderRadius: "md",
          background: codeBg,
        },
        "& pre": {
          overflowX: "auto",
          p: "1rem",
          borderRadius: "xl",
          background: codeBg,
          mb: "1.2rem",
        },
      }}
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );
};


const normalizeMediaType = (m: ArticleMediaDto): "image" | "video" | "pdf" | "other" => {
  const t = String((m as any)?.type ?? "").toLowerCase();
  if (t.includes("image")) return "image";
  if (t.includes("video")) return "video";
  if (t.includes("pdf") || t.includes("document")) return "pdf";

  const u = String((m as any)?.url ?? "").toLowerCase();
  if (u.endsWith(".pdf")) return "pdf";
  if (u.match(/\.(mp4|webm|ogg)$/)) return "video";
  if (u.match(/\.(png|jpe?g|gif|webp|svg)$/)) return "image";
  return "other";
};

const isEmbedVideoUrl = (url: string) => {
  const u = url.toLowerCase();
  return u.includes("youtube.com") || u.includes("youtu.be") || u.includes("vimeo.com");
};

const toEmbedUrl = (url: string) => {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();

    if (host.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    if (host.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }

    if (host.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : url;
    }
  } catch {
    
  }
  return url;
};

const MediaChip = ({ type }: { type: "image" | "video" | "pdf" | "other" }) => {
  if (type === "image") return <Badge colorScheme="teal">IMAGE</Badge>;
  if (type === "video") return <Badge colorScheme="purple">VIDEO</Badge>;
  if (type === "pdf") return <Badge colorScheme="red">PDF</Badge>;
  return <Badge>MEDIA</Badge>;
};

const MediaPreview = ({ m }: { m: ArticleMediaDto }) => {
  const type = normalizeMediaType(m);
  const url = abs(String((m as any)?.url ?? ""));
  const title = String((m as any)?.title ?? "Média");

  const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const bg = useColorModeValue("white", "gray.800");
  const isDark = useColorModeValue(false, true);

  return (
    <Card
      bg={bg}
      borderWidth="1px"
      borderColor={border}
      rounded="2xl"
      overflow="hidden"
      role="group"
      transition="all .25s ease"
      _hover={{ transform: "translateY(-3px)", boxShadow: "lg" }}
    >
      <Box position="relative">
        {type === "image" ? (
          <AspectRatio ratio={16 / 9}>
            <Box position="relative" overflow="hidden">
              <Box as="img" src={url} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} className="media-img" />
              <Box position="absolute" inset={0} opacity={0.22} sx={newspaperPattern(isDark ? "dark" : "light")} pointerEvents="none" />
              <Box position="absolute" inset={0} bgGradient="linear(to-t, blackAlpha.500, transparent 55%)" opacity={0} transition="opacity .25s ease" _groupHover={{ opacity: 1 }} />
              <Box
                position="absolute"
                inset={0}
                pointerEvents="none"
                _groupHover={{ "& .media-img": { transform: "scale(1.06)" } }}
                sx={{ "& .media-img": { transition: "transform .35s ease", transform: "scale(1)" } }}
              />
            </Box>
          </AspectRatio>
        ) : type === "video" ? (
          <AspectRatio ratio={16 / 9}>
            {url && isEmbedVideoUrl(url) ? (
              <Box
                as="iframe"
                src={toEmbedUrl(url)}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <Box as="video" src={url} controls />
            )}
          </AspectRatio>
        ) : type === "pdf" ? (
          <AspectRatio ratio={16 / 9}>
            <Box position="relative">
              <Box position="absolute" inset={0} bg={useColorModeValue("gray.50", "gray.900")} sx={newspaperPattern(isDark ? "dark" : "light")} />
              <Flex position="absolute" inset={0} align="center" justify="center" direction="column" gap={2} p={4}>
                <Icon as={FaFilePdf} boxSize={8} color="red.400" />
                <Text fontWeight="700" textAlign="center" noOfLines={2}>
                  {title}
                </Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Aperçu PDF disponible ci-dessous
                </Text>
              </Flex>
            </Box>
          </AspectRatio>
        ) : (
          <AspectRatio ratio={16 / 9}>
            <Box position="relative">
              <Box position="absolute" inset={0} bg={useColorModeValue("gray.50", "gray.900")} sx={newspaperPattern(isDark ? "dark" : "light")} />
              <Flex position="absolute" inset={0} align="center" justify="center" direction="column" gap={2} p={4}>
                <Icon as={FaExternalLinkAlt} boxSize={6} color="gray.500" />
                <Text fontWeight="700" textAlign="center" noOfLines={2}>
                  {title}
                </Text>
              </Flex>
            </Box>
          </AspectRatio>
        )}

        <Box position="absolute" top={3} left={3}>
          <MediaChip type={type} />
        </Box>
      </Box>

      <CardBody>
        <VStack align="stretch" spacing={2}>
          <Text fontWeight="700" noOfLines={2}>
            {title}
          </Text>

          {(m as any)?.description ? (
            <Text fontSize="sm" color="gray.500" noOfLines={2}>
              {String((m as any).description)}
            </Text>
          ) : null}

          <HStack justify="space-between" pt={1}>
            <HStack spacing={2} color="gray.500" fontSize="sm">
              {type === "image" ? <Icon as={FaImage} /> : null}
              {type === "video" ? <Icon as={FaVideo} /> : null}
              {type === "pdf" ? <Icon as={FaFilePdf} /> : null}
              <Text>{type.toUpperCase()}</Text>
            </HStack>

            <Button as="a" href={url} target="_blank" rel="noreferrer" size="sm" variant="outline" rightIcon={<FaExternalLinkAlt />}>
              Ouvrir
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

const MediaSection = ({ media }: { media: ArticleMediaDto[] }) => {
  const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const bg = useColorModeValue("white", "gray.800");
  const isDark = useColorModeValue(false, true);

  const sorted = useMemo(() => {
    const arr = (media ?? []).slice();
    arr.sort((a: any, b: any) => Number(a?.position ?? 0) - Number(b?.position ?? 0));
    return arr;
  }, [media]);

  const pdfs = sorted.filter((m) => normalizeMediaType(m) === "pdf");

  if (!sorted.length) {
    return (
      <Card bg={bg} borderWidth="1px" borderColor={border} rounded="2xl">
        <CardBody>
          <Box position="relative" rounded="xl" overflow="hidden" p={6}>
            <Box position="absolute" inset={0} opacity={0.7} sx={newspaperPattern(isDark ? "dark" : "light")} />
            <Box position="relative">
              <HStack spacing={3} mb={2}>
                <Icon as={FaImage} color="gray.500" />
                <Heading size="sm">Médias</Heading>
              </HStack>
              <Text color="gray.500">Aucun média (image/vidéo/PDF) n’a été ajouté à cet article.</Text>
            </Box>
          </Box>
        </CardBody>
      </Card>
    );
  }

  return (
    <VStack align="stretch" spacing={5}>
      <Card bg={bg} borderWidth="1px" borderColor={border} rounded="2xl">
        <CardBody>
          <HStack justify="space-between" mb={4} wrap="wrap" gap={2}>
            <Heading size="md">Médias</Heading>
            <Badge variant="subtle" colorScheme="gray">
              {sorted.length}
            </Badge>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
            {sorted.map((m) => (
              <MediaPreview key={String((m as any).id)} m={m} />
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      {pdfs.length > 0 ? (
        <Card bg={bg} borderWidth="1px" borderColor={border} rounded="2xl">
          <CardBody>
            <HStack justify="space-between" mb={4} wrap="wrap" gap={2}>
              <Heading size="sm">Aperçu PDF</Heading>
              <Badge colorScheme="red" variant="subtle">
                {pdfs.length}
              </Badge>
            </HStack>

            <VStack align="stretch" spacing={6}>
              {pdfs.map((p) => {
                const url = abs(String((p as any)?.url ?? ""));
                const title = String((p as any)?.title ?? "Document PDF");
                return (
                  <Box key={String((p as any).id)}>
                    <HStack justify="space-between" mb={2} wrap="wrap" gap={2}>
                      <HStack>
                        <Icon as={FaFilePdf} color="red.400" />
                        <Text fontWeight="700" noOfLines={1}>
                          {title}
                        </Text>
                      </HStack>
                      <Button as="a" href={url} target="_blank" rel="noreferrer" size="sm" variant="outline">
                        Ouvrir
                      </Button>
                    </HStack>

                    <Box borderWidth="1px" borderColor={border} rounded="xl" overflow="hidden">
                      <Box as="iframe" title={title} src={url} width="100%" height="520px" style={{ border: 0 }} />
                    </Box>
                  </Box>
                );
              })}
            </VStack>
          </CardBody>
        </Card>
      ) : null}
    </VStack>
  );
};


const getDisplayAuthors = (article: ArticleDto): DisplayAuthor[] => {
  const links = (article as any)?.authors;
  if (Array.isArray(links) && links.length > 0) {
    const sorted = links.slice().sort((a: any, b: any) => Number(Boolean(b?.isMain)) - Number(Boolean(a?.isMain)));

    return sorted
      .map((l: any) => {
        const u = l?.user ?? {};
        const id = u?.id ?? l?.userId;
        if (!id) return null;
        return {
          id: String(id),
          name: String(u?.name ?? u?.username ?? "Auteur"),
          avatar: u?.avatar ?? null,
          isMain: Boolean(l?.isMain),
        } satisfies DisplayAuthor;
      })
      .filter(Boolean) as DisplayAuthor[];
  }

  if ((article as any).author) {
    return [
      {
        id: String(((article as any).author as any).id ?? "author"),
        name: String(((article as any).author as any).name ?? ((article as any).author as any).username ?? "Auteur"),
        avatar: ((article as any).author as any).avatar ?? null,
        isMain: true,
      },
    ];
  }

  return [];
};

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const isPreview = searchParams.get("preview") === "1";
  const { isOpen: tocOpen, onOpen: openToc, onClose: closeToc } = useDisclosure();

  const pageBg = useColorModeValue("app.pageBg.light", "app.pageBg.dark");
  const cardBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const muted = useColorModeValue("gray.600", "gray.300");

  const [article, setArticle] = useState<ArticleDto | null>(null);
  const [media, setMedia] = useState<ArticleMediaDto[]>([]);

  const [commentsPaged, setCommentsPaged] = useState<Paged<CommentDto>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsLimit] = useState(10);

  const [loading, setLoading] = useState(true);
  const [loadingExtras, setLoadingExtras] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [commentText, setCommentText] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [textTouched, setTextTouched] = useState(false);

  const [posting, setPosting] = useState(false);

  const [toc, setToc] = useState<TocItem[]>([]);
  const [htmlReady, setHtmlReady] = useState("");

  const param = useMemo(() => (postId ? postId.trim() : ""), [postId]);

  const reading = useMemo(() => {
    const text = stripHtml(htmlReady || (article as any)?.content || "");
    return estimateReadingMinutes(text);
  }, [htmlReady, article]);

  const pagesUi = useMemo(() => buildPageItems(commentsPaged.page, commentsPaged.pages), [commentsPaged.page, commentsPaged.pages]);

  const displayAuthors = useMemo(() => (article ? getDisplayAuthors(article) : []), [article]);

  const goBackSmart = () => {
    const from = (location.state as any)?.from as string | undefined;
    if (from) return navigate(from);
    if (window.history.length > 1) return navigate(-1);
    return navigate("/");
  };

  const loadComments = async (articleId: string, p = commentsPage) => {
    const res = await articleService.listCommentsPublic(articleId, { page: p, limit: commentsLimit });
    const paged = normalizePaged<CommentDto>(res, p, commentsLimit);
    setCommentsPaged(paged);
    setCommentsPage(paged.page);
  };

  const onAddComment = async () => {
    if (!(article as any)?.id) return;

    setNameTouched(true);
    setEmailTouched(true);
    setTextTouched(true);

    const name = guestName.trim();
    const email = guestEmail.trim();
    const content = commentText.trim();

    if (!name || !content) return;
    if (email && !isValidEmail(email)) return;

    try {
      setPosting(true);

      await articleService.addCommentPublic(String((article as any).id), {
        content,
        name,
        email: email || undefined,
      });

      setCommentText("");
      toast({
        title: "Commentaire envoyé",
        description: "Il sera publié après modération.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      await loadComments(String((article as any).id), 1);
    } catch (e: any) {
      toast({ title: "Échec commentaire", description: e?.message || "Erreur", status: "error", duration: 3500, isClosable: true });
    } finally {
      setPosting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!param) {
        setError("Article introuvable (param manquant).");
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadingExtras(true);
      setError(null);

      try {
        const a = isUuid(param) ? await articleService.getOne(param) : await articleService.getBySlug(param);
        if (cancelled) return;

        setArticle(a);

        const built = buildTocAndInjectIds((a as any).content ?? "");
        setHtmlReady(built.htmlWithIds);
        setToc(built.toc);

        const articleId = String((a as any).id);

        const m = await articleService.listMedia(articleId);
        if (!cancelled) setMedia(Array.isArray(m) ? (m as any) : []);

        await loadComments(articleId, 1);
      } catch (e: any) {
        setError(e?.message || "Erreur lors du chargement");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingExtras(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [param, isPreview]);

  const getShareUrl = () => window.location.href;

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      toast({ title: "Lien copié", status: "success", duration: 1800, isClosable: true });
    } catch {
      toast({ title: "Impossible de copier", status: "error", duration: 2000, isClosable: true });
    }
  };

  const onNativeShare = async () => {
    const url = getShareUrl();
    const title = (article as any)?.title ?? "Article";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await onCopyLink();
      }
    } catch {
      
    }
  };

  if (loading) {
    return (
      <Box bg={pageBg} minH="100vh" py={10}>
        <Container maxW="container.lg">
          <Flex justify="center" py={10}>
            <Spinner size="lg" />
          </Flex>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg={pageBg} minH="100vh" py={10}>
        <Container maxW="container.md">
          <Card bg={cardBg} borderWidth="1px" borderColor={border} rounded="2xl">
            <CardBody>
              <VStack spacing={3}>
                <Heading size="md" color="red.500">
                  Erreur
                </Heading>
                <Text color={muted}>{error}</Text>
                <Button onClick={goBackSmart} leftIcon={<FaArrowLeft />} variant="primary">
                  Retour
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  if (!article) return null;
  const isPublished = String((article as any).status ?? "").toLowerCase() === "published";

  const nameError = nameTouched && !guestName.trim();
  const emailError = emailTouched && !!guestEmail.trim() && !isValidEmail(guestEmail.trim());
  const textError = textTouched && !commentText.trim();

  return (
    <Box bg={pageBg} minH="100vh" py={{ base: 6, md: 10 }} position="relative">
      <Container maxW="container.lg">
        <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
          <Button onClick={goBackSmart} leftIcon={<FaArrowLeft />} variant="ghost">
            Retour
          </Button>

          <HStack>
            <Button leftIcon={<FaListUl />} variant="outline" onClick={openToc} isDisabled={!toc.length}>
              Sommaire
            </Button>

            <Button leftIcon={<FaShareAlt />} variant="outline" onClick={onNativeShare}>
              Partager
            </Button>

            <IconButton aria-label="Copier le lien" icon={<FaCopy />} variant="outline" onClick={onCopyLink} />
          </HStack>
        </Flex>

        {isPreview && !isPublished ? (
          <Card mb={6} borderWidth="1px" borderColor={border} rounded="2xl">
            <CardBody>
              <HStack justify="space-between" wrap="wrap" gap={3}>
                <HStack>
                  <Badge colorScheme="purple" variant="solid">
                    PREVIEW
                  </Badge>
                  <Text color={muted}>
                    Vous consultez une version de prévisualisation (statut: <b>{String((article as any).status ?? "—")}</b>)
                  </Text>
                </HStack>
                <Button size="sm" variant="outline" onClick={goBackSmart}>
                  Retour à la liste
                </Button>
              </HStack>
            </CardBody>
          </Card>
        ) : null}

        <Card bg={cardBg} borderWidth="1px" borderColor={border} rounded="2xl" mb={6}>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack spacing={3} wrap="wrap">
                <Badge colorScheme={isPublished ? "green" : "orange"} variant="subtle">
                  {isPublished ? "Publié" : "Brouillon"}
                </Badge>

                {(article as any)?.category?.name && (
                  <Badge colorScheme="purple" variant="outline">
                    {(article as any).category.name}
                  </Badge>
                )}

                <HStack spacing={2} color={muted} fontSize="sm">
                  <FaEye />
                  <Text>{safeNumber((article as any).views, 0).toLocaleString("fr-FR")} vues</Text>
                </HStack>

                <Text color={muted} fontSize="sm">
                  {(article as any).publishedAt
                    ? `Publié le ${formatDate((article as any).publishedAt)}`
                    : `Créé le ${formatDate((article as any).createdAt ?? null)}`}
                </Text>

                <Badge variant="subtle" colorScheme="teal">
                  ⏱ {reading.mins} min de lecture • {reading.words.toLocaleString("fr-FR")} mots
                </Badge>
              </HStack>

              <Heading size="xl" lineHeight="1.2">
                {(article as any).title}
              </Heading>

              {(article as any).excerpt && (
                <Text color={muted} fontSize="lg" lineHeight="1.7">
                  {String((article as any).excerpt)}
                </Text>
              )}

              <VStack align="start" spacing={2}>
                <HStack spacing={3} wrap="wrap">
                  {displayAuthors.length === 0 ? (
                    <HStack spacing={3}>
                      <Avatar size="sm" name={"Auteur"} />
                      <Text fontWeight="semibold">Auteur</Text>
                    </HStack>
                  ) : (
                    displayAuthors.map((a) => (
                      <HStack key={a.id} spacing={2} pr={2}>
                        <Avatar size="sm" name={a.name} src={a.avatar ? abs(String(a.avatar)) : undefined} />
                        <Box>
                          <HStack spacing={2}>
                            <Text fontWeight="semibold" noOfLines={1}>
                              {a.name}
                            </Text>
                            {a.isMain ? (
                              <Badge colorScheme="yellow" variant="solid">
                                Main
                              </Badge>
                            ) : (
                              <Badge variant="subtle">Co-auteur</Badge>
                            )}
                          </HStack>
                        </Box>
                      </HStack>
                    ))
                  )}
                </HStack>

                <Text fontSize="sm" color={muted}>
                  MAJ : {formatDateTime((article as any).updatedAt ?? null)}
                </Text>
              </VStack>

              {Array.isArray((article as any).tags) && (article as any).tags.length > 0 && (
                <HStack spacing={2} wrap="wrap">
                  {(article as any).tags.map((t: string) => (
                    <Tag key={t} colorScheme="teal" variant="subtle">
                      <TagLabel>#{t}</TagLabel>
                    </Tag>
                  ))}
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        {Boolean((article as any).featuredImage) && (
          <Box mb={6}>
            <Box borderWidth="1px" borderColor={border} rounded="2xl" overflow="hidden">
              <Box as="img" src={abs(String((article as any).featuredImage))} alt={(article as any).title} w="100%" maxH="420px" objectFit="cover" />
            </Box>
          </Box>
        )}

        <ArticleHtml html={htmlReady || String((article as any).content || "")} />

        <Box mt={8}>
          {loadingExtras ? (
            <Flex justify="center" py={8}>
              <Spinner />
            </Flex>
          ) : (
            <MediaSection media={media} />
          )}
        </Box>

        <Box mt={10}>
          <Card bg={cardBg} borderWidth="1px" borderColor={border} rounded="2xl">
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                  <Heading size="md">Commentaires</Heading>
                  <Text color={muted} fontSize="sm">
                    {commentsPaged.total.toLocaleString("fr-FR")} commentaire(s)
                  </Text>
                </Flex>

                <Divider />

                <VStack align="stretch" spacing={3}>
                  <Text fontSize="sm" color={muted}>
                    Écrire un commentaire (sans compte)
                  </Text>

                  <HStack flexDir={{ base: "column", md: "row" }} align="stretch">
                    <FormControl isInvalid={nameError}>
                      <Input
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        onBlur={() => setNameTouched(true)}
                        placeholder="Votre nom (obligatoire)"
                      />
                      {nameError ? <FormErrorMessage>Le nom est obligatoire.</FormErrorMessage> : null}
                    </FormControl>

                    <FormControl isInvalid={emailError}>
                      <Input
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        onBlur={() => setEmailTouched(true)}
                        placeholder="Email (optionnel)"
                        type="email"
                      />
                      {emailError ? <FormErrorMessage>Email invalide.</FormErrorMessage> : null}
                    </FormControl>
                  </HStack>

                  <FormControl isInvalid={textError}>
                    <Input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onBlur={() => setTextTouched(true)}
                      placeholder="Votre commentaire..."
                    />
                    {textError ? <FormErrorMessage>Le commentaire est obligatoire.</FormErrorMessage> : null}
                  </FormControl>

                  <Flex justify="flex-end">
                    <Button variant="primary" onClick={onAddComment} isLoading={posting}>
                      Publier
                    </Button>
                  </Flex>

                  <Text fontSize="xs" color={muted}>
                    Votre commentaire peut apparaître après modération.
                  </Text>
                </VStack>

                <Divider />

                {commentsPaged.items.length === 0 ? (
                  <Text color={muted}>Aucun commentaire pour le moment.</Text>
                ) : (
                  <VStack align="stretch" spacing={4}>
                    {commentsPaged.items.map((c) => {
                      const displayName =
                        (c.user?.name && String(c.user.name)) ||
                        (c as any)?.guestName ||
                        "Utilisateur";

                      const avatar = (c.user as any)?.avatar ?? undefined;

                      return (
                        <Box key={c.id} borderWidth="1px" borderColor={border} rounded="xl" p={4}>
                          <HStack spacing={3} align="start">
                            <Avatar size="sm" name={displayName} src={avatar ? abs(String(avatar)) : undefined} />
                            <Box flex="1">
                              <HStack spacing={2} wrap="wrap">
                                <Text fontWeight="semibold">{displayName}</Text>
                                <Text fontSize="sm" color={muted}>
                                  {formatDateTime((c as any).createdAt ?? null)}
                                </Text>
                              </HStack>
                              <Text mt={2} whiteSpace="pre-wrap">
                                {c.content}
                              </Text>
                            </Box>
                          </HStack>
                        </Box>
                      );
                    })}
                  </VStack>
                )}

                {commentsPaged.pages > 1 && (
                  <Flex mt={4} align="center" justify="center" wrap="wrap" gap={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      isDisabled={commentsPaged.page <= 1}
                      onClick={async () => (article as any)?.id && loadComments(String((article as any).id), Math.max(1, commentsPaged.page - 1))}
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
                          variant={p === commentsPaged.page ? "solid" : "outline"}
                          colorScheme={p === commentsPaged.page ? "teal" : "gray"}
                          onClick={async () => (article as any)?.id && loadComments(String((article as any).id), p)}
                        >
                          {p}
                        </Button>
                      )
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      isDisabled={commentsPaged.page >= commentsPaged.pages}
                      onClick={async () =>
                        (article as any)?.id && loadComments(String((article as any).id), Math.min(commentsPaged.pages, commentsPaged.page + 1))
                      }
                    >
                      →
                    </Button>
                  </Flex>
                )}

                <Text fontSize="sm" color={muted} textAlign="center">
                  Page {commentsPaged.page} / {commentsPaged.pages}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </Box>

        <Box h={12} />

        <Drawer isOpen={tocOpen} placement="right" onClose={closeToc}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Sommaire</DrawerHeader>
            <DrawerBody>
              {toc.length === 0 ? (
                <Text color={muted}>Aucun titre H2/H3 détecté.</Text>
              ) : (
                <VStack align="stretch" spacing={2}>
                  {toc.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      justifyContent="flex-start"
                      pl={item.level === 3 ? 8 : 3}
                      onClick={() => {
                        closeToc();
                        setTimeout(() => scrollToId(item.id), 50);
                      }}
                    >
                      <Text noOfLines={1} fontWeight={item.level === 2 ? "semibold" : "normal"}>
                        {item.text}
                      </Text>
                    </Button>
                  ))}
                </VStack>
              )}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Container>
    </Box>
  );
}
