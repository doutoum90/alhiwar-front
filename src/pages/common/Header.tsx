import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  Divider,
  Badge,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { categoryService } from "../../services/categoryService";
import type { CategoryDto } from "../../types";
import { normalize } from "../../utils/utils";
import { NavLink } from "./NavLink";
import { PUBLIC_MENU } from "../../constantes";

const Header: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const isCategoryRoute = useMemo(
    () => location.pathname.startsWith("/categories/"),
    [location.pathname]
  );

  const activeCategorySlug = useMemo(() => {
    if (!isCategoryRoute) return null;
    const parts = location.pathname.split("/").filter(Boolean);
    return parts[1] ?? null;
  }, [isCategoryRoute, location.pathname]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setCatLoading(true);
        const data = await categoryService.getPublished().catch(() => []);
        const list = (data ?? []).filter(Boolean);
        list.sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));
        if (mounted) setCategories(list);
      } finally {
        if (mounted) setCatLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const categoryItems = useMemo(() => {
    return categories.map((c) => {
      const slug = normalize(c.slug ?? "") || normalize(c.name ?? "") || String(c.id);
      return { id: c.id, name: c.name, slug, color: (c as any).color ?? null };
    });
  }, [categories]);

  const goCategory = (slug: string) => navigate(`/categories/${encodeURIComponent(slug)}`);

  return (
    <Box bg={useColorModeValue("white", "gray.900")} px={4} boxShadow="sm" position="sticky" top="0" zIndex="999">
      <Flex h={16} alignItems="center" justifyContent="space-between" maxW="7xl" mx="auto">
        <RouterLink to="/">
          <Text fontSize="xl" fontWeight="bold" color={useColorModeValue("blue.600", "blue.300")}>
            Journal Alhiwar
          </Text>
        </RouterLink>

        <HStack spacing={2} display={{ base: "none", md: "flex" }} alignItems="center">
          {PUBLIC_MENU.map((link) => (
            <NavLink key={link.label} to={link.link} isActive={isActive(link.link)}>
              {link.label}
            </NavLink>
          ))}

          <Menu isLazy>
            <MenuButton
              as={Button}
              size="sm"
              variant={isCategoryRoute ? "solid" : "ghost"}
              colorScheme={isCategoryRoute ? "blue" : undefined}
              rightIcon={<ChevronDownIcon />}
            >
              Catégories
            </MenuButton>

            <MenuList minW="260px">
              <Box px={3} py={2}>
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="semibold">
                    Rubriques (publiées)
                  </Text>
                  {catLoading ? <Spinner size="sm" /> : null}
                </HStack>
                <Text fontSize="xs" color={useColorModeValue("gray.600", "gray.300")} mt={1}>
                  Accédez rapidement aux articles par catégorie.
                </Text>
              </Box>

              <Divider />

              {categoryItems.length === 0 && !catLoading ? (
                <MenuItem isDisabled>Aucune catégorie publiée</MenuItem>
              ) : null}

              {categoryItems.map((c) => {
                const active = activeCategorySlug === c.slug;
                return (
                  <MenuItem
                    key={c.id}
                    onClick={() => goCategory(c.slug)}
                    fontWeight={active ? "semibold" : "normal"}
                  >
                    <HStack spacing={2}>
                      <Box
                        w="10px"
                        h="10px"
                        borderRadius="full"
                        bg={c.color ?? useColorModeValue("gray.300", "gray.600")}
                      />
                      <Text>{c.name}</Text>
                      {active ? (
                        <Badge ml={2} colorScheme="blue" variant="subtle">
                          Actif
                        </Badge>
                      ) : null}
                    </HStack>
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>

          <Button onClick={toggleColorMode} size="sm" variant="ghost">
            {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          </Button>
        </HStack>

        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Menu"
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
          variant="ghost"
        />
      </Flex>

      {isOpen && (
        <Box pb={4} display={{ md: "none" }}>
          <Stack as="nav" spacing={2}>
            {PUBLIC_MENU.map((link) => (
              <NavLink key={link.link} to={link.link} isActive={isActive(link.link)} onClick={onClose}>
                {link.link}
              </NavLink>
            ))}

            <Box px={3} pt={2}>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="semibold">
                  Catégories (publiées)
                </Text>
                {catLoading ? <Spinner size="sm" /> : null}
              </HStack>

              <Stack spacing={1}>
                {categoryItems.length === 0 && !catLoading ? (
                  <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.300")}>
                    Aucune catégorie publiée
                  </Text>
                ) : null}

                {categoryItems.map((c) => {
                  const active = activeCategorySlug === c.slug;
                  return (
                    <Button
                      key={c.id}
                      size="sm"
                      justifyContent="flex-start"
                      variant={active ? "solid" : "ghost"}
                      colorScheme={active ? "blue" : undefined}
                      onClick={() => {
                        goCategory(c.slug);
                        onClose();
                      }}
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
                  );
                })}
              </Stack>
            </Box>

            <Button onClick={toggleColorMode} size="sm" alignSelf="start" ml={3} variant="ghost">
              {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Header;
