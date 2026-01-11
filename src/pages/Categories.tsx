import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

import { categoryService } from "../services/categoryService";
import type { CategoryDto } from "../types";
import { normalize } from "../utils/utils";

const toSlug = (c: CategoryDto) =>
  normalize(c.slug ?? "") || normalize(c.name ?? "") || String(c.id);

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getPublished().catch(() => [] as CategoryDto[]);
      const list = (data ?? []).filter(Boolean);
      list.sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));
      setCategories(list);
    } catch (e: any) {
      setError(e?.message || "Impossible de charger les rubriques.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  const items = useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        name: c.name ?? "Rubrique",
        slug: toSlug(c),
        color: (c as any).color ?? null,
      })),
    [categories]
  );

  if (loading) {
    return (
      <VStack mt={12}>
        <Spinner size="xl" />
        <Text color="gray.500">Chargement...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error" mt={10} maxW="xl" mx="auto" borderRadius="lg">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Erreur</Text>
          <Text>{error}</Text>
          <Button mt={3} size="sm" onClick={load}>
            Reessayer
          </Button>
        </Box>
      </Alert>
    );
  }

  return (
    <Box bg={pageBg} minH="calc(100vh - 120px)">
      <Box maxW="7xl" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }}>
        <VStack spacing={2} mb={8}>
          <Heading as="h1" size="lg" textAlign="center">
            Rubriques
          </Heading>
          <Text color="gray.600" textAlign="center" maxW="2xl">
            Choisissez une rubrique pour voir les articles publies.
          </Text>
          <Badge variant="subtle" colorScheme="teal">
            {items.length} rubrique(s)
          </Badge>
        </VStack>

        {items.length === 0 ? (
          <Text textAlign="center" color="gray.500">
            Aucune rubrique publiee.
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
            {items.map((c) => (
              <Button
                key={c.id}
                bg={cardBg}
                variant="outline"
                justifyContent="flex-start"
                onClick={() => navigate(`/categories/${encodeURIComponent(c.slug)}`)}
                leftIcon={
                  <Box
                    w="10px"
                    h="10px"
                    borderRadius="full"
                    bg={c.color ?? useColorModeValue("gray.300", "gray.600")}
                  />
                }
              >
                {c.name}
              </Button>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
}
