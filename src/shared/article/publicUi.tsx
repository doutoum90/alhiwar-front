import type { ReactNode } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Stack,
  Text,
  AspectRatio,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaArrowRight, FaBolt, FaRegClock, FaRegImage } from "react-icons/fa";
import { abs } from "../../utils/url";
import type { AdDto } from "../../services/adsService";

export type UiPost = {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string | null;
  publishedAt?: string | null;
  slug?: string | null;
  categoryLabel?: string | null;
  views?: number | null;
};



export const safeTime = (iso?: string | null) => {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
};

export const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR");
};



export const BREAKING_HOURS = 48;

export const isBreaking = (iso?: string | null) => {
  if (!iso) return false;
  const t = safeTime(iso);
  if (!t) return false;
  const diff = Date.now() - t;
  return diff >= 0 && diff <= BREAKING_HOURS * 60 * 60 * 1000;
};



export const newspaperPattern = (mode: "light" | "dark") => {
  const dot = mode === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";
  const line = mode === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)";

  return {
    backgroundImage: `
      radial-gradient(${dot} 1px, transparent 1px),
      linear-gradient(to bottom, ${line} 1px, transparent 1px)
    `,
    backgroundSize: "14px 14px, 100% 10px",
    backgroundPosition: "0 0, 0 0",
  } as const;
};

export const initials = (title: string) => {
  const t = (title || "").trim();
  if (!t) return "A";
  const parts = t.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "A";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
};



export function CoverFallback({
  title,
  category,
  breaking,
  variant,
}: {
  title: string;
  category?: string | null;
  breaking?: boolean;
  variant: "hero" | "card" | "mini";
}) {
  const isDark = useColorModeValue(false, true);
  const bg = useColorModeValue("gray.50", "gray.800");
  const overlay = useColorModeValue("blackAlpha.100", "blackAlpha.500");
  const chipBg = useColorModeValue("whiteAlpha.900", "blackAlpha.500");
  const chipColor = useColorModeValue("gray.800", "whiteAlpha.900");

  const size = variant === "hero" ? "56px" : variant === "card" ? "46px" : "34px";
  const fontSize = variant === "hero" ? "xl" : variant === "card" ? "lg" : "md";

  return (
    <Box position="relative" w="100%" h="100%" bg={bg} overflow="hidden">
      <Box
        position="absolute"
        inset={0}
        bgGradient={useColorModeValue(
          "linear(to-br, teal.50, purple.50, orange.50)",
          "linear(to-br, teal.900, purple.900, gray.900)"
        )}
        opacity={0.95}
      />

      <Box position="absolute" inset={0} opacity={0.7} sx={newspaperPattern(isDark ? "dark" : "light")} />
      <Box position="absolute" inset={0} bg={overlay} />

      <Flex position="absolute" inset={0} align="center" justify="center" px={4}>
        <HStack spacing={3} maxW="95%">
          <Flex
            w={size}
            h={size}
            borderRadius="2xl"
            align="center"
            justify="center"
            bg={chipBg}
            color={chipColor}
            fontWeight="800"
            fontSize={fontSize}
            boxShadow="md"
            flex="0 0 auto"
          >
            {initials(title)}
          </Flex>

          {variant !== "mini" ? (
            <Box minW={0}>
              <HStack spacing={2} wrap="wrap">
                {breaking ? (
                  <Badge colorScheme="red" variant="solid">
                    <HStack spacing={1}>
                      <Icon as={FaBolt} />
                      <Text>BREAKING</Text>
                    </HStack>
                  </Badge>
                ) : null}

                {category ? (
                  <Badge colorScheme="teal" variant="solid">
                    {category}
                  </Badge>
                ) : null}

                <Badge variant="subtle" colorScheme="gray">
                  <HStack spacing={1}>
                    <Icon as={FaRegImage} />
                    <Text>Sans média</Text>
                  </HStack>
                </Badge>
              </HStack>

              <Text mt={2} fontWeight="800" noOfLines={2} color={useColorModeValue("gray.900", "white")}>
                {title || "—"}
              </Text>
            </Box>
          ) : null}
        </HStack>
      </Flex>
    </Box>
  );
}



export function Cover({
  post,
  ratio,
  variant,
}: {
  post: UiPost;
  ratio: number;
  variant: "hero" | "card" | "mini";
}) {
  
  const isDark = useColorModeValue(false, true);
  const patternOpacity = useColorModeValue(0.28, 0.22);

  const src = post.imageUrl ? abs(String(post.imageUrl)) : "";
  const breaking = isBreaking(post.publishedAt);

  return (
    <AspectRatio ratio={ratio}>
      {src ? (
        <Box position="relative" w="100%" h="100%" overflow="hidden">
          <Image
            src={src}
            alt={post.title}
            objectFit="cover"
            w="100%"
            h="100%"
            transform="scale(1)"
            transition="transform .35s ease"
            className="cover-img"
          />

          <Box
            position="absolute"
            inset={0}
            opacity={patternOpacity} 
            sx={newspaperPattern(isDark ? "dark" : "light")}
            pointerEvents="none"
          />

          {breaking ? (
            <Badge
              position="absolute"
              top={3}
              left={3}
              colorScheme="red"
              variant="solid"
              borderRadius="md"
              px={2}
              py={1}
              boxShadow="md"
            >
              <HStack spacing={1}>
                <Icon as={FaBolt} />
                <Text>BREAKING</Text>
              </HStack>
            </Badge>
          ) : null}
        </Box>
      ) : (
        <CoverFallback
          title={post.title}
          category={post.categoryLabel}
          breaking={breaking}
          variant={variant}
        />
      )}
    </AspectRatio>
  );
}




export function HeroCard({ post, onOpen }: { post: UiPost; onOpen: (slugOrId: string) => void }) {
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");

  return (
    <Card
      bg={bg}
      border="1px solid"
      borderColor={border}
      shadow="md"
      borderRadius="2xl"
      overflow="hidden"
      role="group"
      transition="all .25s ease"
      _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
    >
      <Box position="relative">
        <Cover post={post} ratio={16 / 7} variant="hero" />
        {post.imageUrl ? <Box position="absolute" inset={0} bg="blackAlpha.600" /> : null}

        <Box position="absolute" inset={0} pointerEvents="none" _groupHover={{ "& .cover-img": { transform: "scale(1.06)" } }} />

        <Box position="absolute" bottom={0} left={0} right={0} p={{ base: 4, md: 6 }}>
          <HStack spacing={2} mb={2} wrap="wrap">
            {isBreaking(post.publishedAt) ? (
              <Badge colorScheme="red" variant="solid">
                <HStack spacing={1}>
                  <Icon as={FaBolt} />
                  <Text>BREAKING</Text>
                </HStack>
              </Badge>
            ) : null}

            {post.categoryLabel ? (
              <Badge colorScheme="teal" variant="solid">
                {post.categoryLabel}
              </Badge>
            ) : null}

            <Badge variant="subtle" colorScheme="gray">
              <HStack spacing={1}>
                <Icon as={FaRegClock} />
                <Text>{formatDate(post.publishedAt)}</Text>
              </HStack>
            </Badge>

            <Badge variant="subtle" colorScheme="purple">
              {post.views ?? 0} vues
            </Badge>

            {!post.imageUrl ? (
              <Badge variant="subtle" colorScheme="orange">
                Sans média
              </Badge>
            ) : null}
          </HStack>

          <Heading color={post.imageUrl ? "white" : useColorModeValue("gray.900", "white")} size={{ base: "md", md: "lg" }} noOfLines={2}>
            {post.title}
          </Heading>

          <Text color={post.imageUrl ? "whiteAlpha.900" : useColorModeValue("gray.700", "whiteAlpha.900")} mt={2} noOfLines={2}>
            {post.summary || "—"}
          </Text>

          <Button
            mt={4}
            colorScheme="teal"
            rightIcon={<FaArrowRight />}
            onClick={() => onOpen(post.slug ?? post.id)}
            position="relative"
            _after={{
              content: '""',
              position: "absolute",
              left: "12px",
              right: "12px",
              bottom: "8px",
              height: "2px",
              bg: "whiteAlpha.600",
              transform: "scaleX(0)",
              transformOrigin: "left",
              transition: "transform .25s ease",
            }}
            _hover={{ _after: { transform: "scaleX(1)" } }}
          >
            Lire la suite
          </Button>
        </Box>
      </Box>
    </Card>
  );
}

export function PostCard({ post, onOpen }: { post: UiPost; onOpen: (slugOrId: string) => void }) {
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");

  return (
    <Card
      bg={bg}
      border="1px solid"
      borderColor={border}
      shadow="sm"
      borderRadius="xl"
      overflow="hidden"
      role="group"
      transition="all .25s ease"
      _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
    >
      <Box position="relative">
        <Cover post={post} ratio={16 / 9} variant="card" />
        <Box position="absolute" inset={0} pointerEvents="none" _groupHover={{ "& .cover-img": { transform: "scale(1.06)" } }} />
        <Box
          position="absolute"
          inset={0}
          bgGradient="linear(to-t, blackAlpha.400, transparent 55%)"
          opacity={0}
          transition="opacity .25s ease"
          pointerEvents="none"
          _groupHover={{ opacity: post.imageUrl ? 1 : 0 }}
        />
      </Box>

      <CardBody>
        <Stack spacing={2}>
          <HStack justify="space-between" align="baseline">
            <HStack spacing={2} wrap="wrap">
              {isBreaking(post.publishedAt) ? (
                <Badge colorScheme="red" variant="solid">
                  <HStack spacing={1}>
                    <Icon as={FaBolt} />
                    <Text>BREAKING</Text>
                  </HStack>
                </Badge>
              ) : null}

              {post.categoryLabel ? (
                <Badge colorScheme="teal" variant="subtle">
                  {post.categoryLabel}
                </Badge>
              ) : (
                <Badge colorScheme="gray" variant="subtle">
                  Autres
                </Badge>
              )}

              {!post.imageUrl ? (
                <Badge variant="subtle" colorScheme="orange">
                  Sans média
                </Badge>
              ) : null}
            </HStack>

            <Text fontSize="xs" color="gray.500">
              {formatDate(post.publishedAt)}
            </Text>
          </HStack>

          <Heading as="h3" size="sm" noOfLines={2}>
            {post.title}
          </Heading>

          <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.300")} noOfLines={3}>
            {post.summary || "—"}
          </Text>

          <Button
            variant="link"
            colorScheme="teal"
            alignSelf="start"
            onClick={() => onOpen(post.slug ?? post.id)}
            rightIcon={<FaArrowRight />}
            position="relative"
            _after={{
              content: '""',
              position: "absolute",
              left: 0,
              bottom: "-2px",
              height: "2px",
              width: "100%",
              bg: "currentColor",
              transform: "scaleX(0)",
              transformOrigin: "left",
              transition: "transform .25s ease",
            }}
            _groupHover={{ _after: { transform: "scaleX(1)" } }}
          >
            Lire
          </Button>
        </Stack>
      </CardBody>
    </Card>
  );
}

export function RubriqueSection({
  title,
  posts,
  onOpen,
  rightSlot,
}: {
  title: string;
  posts: UiPost[];
  onOpen: (slugOrId: string) => void;
  rightSlot?: ReactNode;
}) {
  return (
    <Box>
      <HStack justify="space-between" mb={3} align="baseline">
        <Heading size="md">{title}</Heading>
        {rightSlot ?? null}
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {posts.map((p) => (
          <PostCard key={p.id} post={p} onOpen={onOpen} />
        ))}
      </SimpleGrid>
    </Box>
  );
}

export function ArchiveMiniCard({ a, onOpen }: { a: UiPost; onOpen: (slugOrId: string) => void }) {
  const border = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.800");

  return (
    <Box
      p={3}
      border="1px solid"
      borderColor={border}
      borderRadius="lg"
      cursor="pointer"
      _hover={{ bg: hoverBg, transform: "translateY(-2px)" }}
      transition="all .2s ease"
      onClick={() => onOpen(a.slug ?? a.id)}
    >
      <HStack spacing={3} align="start">
        <Box w="56px" h="56px" borderRadius="md" overflow="hidden" flex="0 0 auto">
          {a.imageUrl ? (
            <Image src={abs(String(a.imageUrl))} alt={a.title} w="full" h="full" objectFit="cover" />
          ) : (
            <CoverFallback title={a.title} category={a.categoryLabel} breaking={isBreaking(a.publishedAt)} variant="mini" />
          )}
        </Box>

        <Box flex="1" minW={0}>
          <Text fontWeight="semibold" fontSize="sm" noOfLines={2}>
            {a.title}
          </Text>
          <HStack justify="space-between" mt={1}>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {a.categoryLabel ?? "—"}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {formatDate(a.publishedAt)}
            </Text>
          </HStack>

          <HStack mt={2} spacing={2} wrap="wrap">
            {isBreaking(a.publishedAt) ? (
              <Badge colorScheme="red" variant="subtle">
                <HStack spacing={1}>
                  <Icon as={FaBolt} />
                  <Text>Breaking</Text>
                </HStack>
              </Badge>
            ) : null}
            {!a.imageUrl ? (
              <Badge variant="subtle" colorScheme="orange">
                Sans média
              </Badge>
            ) : null}
          </HStack>
        </Box>
      </HStack>
    </Box>
  );
}



export function AdCard({ ad, variant }: { ad?: AdDto | null; variant: "banner" | "sidebar" | "inline" }) {
  
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const labelBg = useColorModeValue("gray.100", "gray.700");

  if (!ad) return null;

  const isClickable = Boolean(ad.link);

  const content = (
    <Card bg={bg} border="1px solid" borderColor={border} shadow="sm" borderRadius="lg" overflow="hidden">
      <CardBody>
        <HStack justify="space-between" mb={2}>
          <Badge bg={labelBg} color={useColorModeValue("gray.700", "gray.200")}>
            Publicité
          </Badge>
          <Badge colorScheme="teal" variant="subtle">
            {variant.toUpperCase()}
          </Badge>
        </HStack>

        {ad.image ? (
          <AspectRatio ratio={variant === "banner" ? 16 / 5 : 16 / 9} mb={3}>
            <Image src={abs(String(ad.image))} alt={ad.title} objectFit="cover" borderRadius="md" />
          </AspectRatio>
        ) : null}

        <Heading size="sm" noOfLines={2} mb={1}>
          {ad.title}
        </Heading>
        <Text fontSize="sm" color="gray.500" noOfLines={variant === "sidebar" ? 3 : 2}>
          {ad.content}
        </Text>

        {isClickable ? (
          <Button mt={3} size="sm" colorScheme="teal" variant="outline">
            Visiter
          </Button>
        ) : null}
      </CardBody>
    </Card>
  );

  if (!isClickable) return content;

  return (
    <Box as="a" href={ad.link ?? "#"} target="_blank" rel="noreferrer" _hover={{ textDecoration: "none" }}>
      {content}
    </Box>
  );
}

