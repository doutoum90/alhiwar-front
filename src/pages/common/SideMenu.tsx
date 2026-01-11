import {
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  VStack,
  usePrefersReducedMotion,
} from "@chakra-ui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMoon, FiSun } from "react-icons/fi";
import { motion } from "framer-motion";
import { PROTECTED_MENU } from "../../constantes";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import { useAdminBadges } from "../../hooks/useAdminBadges";
import { canAccess } from "../../utils/access";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

export const SideMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = usePrefersReducedMotion();
  const { user, logout } = useAuth();
  const { colorMode, toggleColorMode, colors } = useTheme();
  const { reviewArticles, reviewCategories, reviewAds, reviewUsers, unreadMessages } = useAdminBadges();
  const filteredMenu = (PROTECTED_MENU as any[]).filter((item) => {
    if (item.path === "/auth/login") return true;
    return canAccess(user as any, { roles: item.roles, permissions: item.permissions });
  });

  const menuVariants = {
    hidden: { x: -14, opacity: 0 },
    show: {
      x: 0,
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { y: 6, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const hoverTap = reduceMotion
    ? {}
    : {
      whileHover: { x: 4 },
      whileTap: { scale: 0.98 },
      transition: { type: "spring", stiffness: 420, damping: 28 },
    };

  const getItemBadge = (path: string) => {
    if (path === "/espace-membre/dashboard") {
      const total = reviewArticles + reviewCategories + reviewAds + reviewUsers;
      return { value: total, color: "teal" as const, tooltip: `${total} élément(s) en attente de review` };
    }
    if (path === "/espace-membre/articles") {
      return { value: reviewArticles, color: "blue" as const, tooltip: `${reviewArticles} article(s) en review` };
    }

    if (path === "/espace-membre/categories") {
      return { value: reviewCategories, color: "yellow" as const, tooltip: `${reviewCategories} catégorie(s) en review` };
    }

    if (path === "/espace-membre/ads") {
      return { value: reviewAds, color: "purple" as const, tooltip: `${reviewAds} publicité(s) en review` };
    }

    if (path === "/espace-membre/users") {
      return { value: reviewUsers, color: "orange" as const, tooltip: `${reviewUsers} utilisateur(s) en review` };
    }

    if (path === "/espace-membre/messages") {
      return { value: unreadMessages, color: "red" as const, tooltip: `${unreadMessages} message(s) non lu(s)` };
    }

    return { value: 0, color: "gray" as const, tooltip: "" };
  };

  return (
    <MotionBox
      as="nav"
      position="fixed"
      top="0"
      left="0"
      w="250px"
      h="100vh"
      bg={colors.background}
      borderRight="1px"
      borderColor={colors.border}
      boxShadow="md"
      p={4}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      zIndex="sticky"
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion ? false : "show"}
      variants={menuVariants}
    >
      {}
      <VStack align="stretch" spacing={2}>
        {filteredMenu
          .filter((x) => x.path !== "/auth/login")
          .map((item) => {
            const isActive = location.pathname === item.path;
            const badge = getItemBadge(item.path);

            return (
              <MotionBox key={item.path} variants={itemVariants}>
                <Tooltip label={item.name} placement="right">
                  <MotionButton
                    as={Link}
                    to={item.path}
                    variant={isActive ? "solid" : "ghost"}
                    colorScheme="brand"
                    justifyContent="flex-start"
                    px={4}
                    py={3}
                    gap={3}
                    fontWeight={isActive ? "semibold" : "normal"}
                    aria-current={isActive ? "page" : undefined}
                    _hover={{ bg: colors.hover }}
                    {...hoverTap}
                  >
                    <Icon as={item.icon} fontSize="lg" color={colors.icon} />

                    <Flex flex="1" minW={0} align="center" justify="space-between" gap={2}>
                      <Text noOfLines={1}>{item.name}</Text>

                      <HStack spacing={2}>
                        {badge.value > 0 ? (
                          <Tooltip label={badge.tooltip} placement="top" hasArrow openDelay={250}>
                            <Badge
                              colorScheme={badge.color}
                              borderRadius="full"
                              px={2}
                              fontSize="xs"
                              variant={isActive ? "solid" : "subtle"}
                            >
                              {badge.value}
                            </Badge>
                          </Tooltip>
                        ) : null}

                        {isActive ? (
                          <MotionBox
                            w="8px"
                            h="8px"
                            borderRadius="full"
                            bg="brand.400"
                            ml={1}
                            layout
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        ) : null}
                      </HStack>
                    </Flex>
                  </MotionButton>
                </Tooltip>
              </MotionBox>
            );
          })}
      </VStack>

      {}
      <Center flexDirection="column" gap={3}>
        <Divider borderColor={colors.border} />

        <Tooltip label={`Passer au mode ${colorMode === "light" ? "sombre" : "clair"}`} placement="right">
          <MotionBox w="full" whileHover={reduceMotion ? undefined : { scale: 1.01 }} whileTap={reduceMotion ? undefined : { scale: 0.99 }}>
            <IconButton
              aria-label="Toggle theme"
              icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              variant="ghost"
              w="full"
              _hover={{ bg: colors.hover }}
            />
          </MotionBox>
        </Tooltip>

        <Divider borderColor={colors.border} />

        <Menu>
          <MenuButton as={Button} variant="ghost" w="full" px={2}>
            <Flex align="center" gap={3}>
              <Avatar size="sm" name={user?.email} src={user?.avatar ?? undefined} bg="brand.500" color="white" />
              <Text fontSize="sm" noOfLines={1}>
                {user?.email}
              </Text>
            </Flex>
          </MenuButton>

          <MenuList bg={colors.background} borderColor={colors.border}>
            <MenuItem _hover={{ bg: colors.hover }}>
              <Flex direction="column">
                <Text fontWeight="semibold">{user?.email}</Text>
                <Text fontSize="sm" color={colors.subtle}>
                  Compte utilisateur
                </Text>
              </Flex>
            </MenuItem>

            <MenuDivider borderColor={colors.border} />

            <MenuItem onClick={() => navigate("/espace-membre/profile")} _hover={{ bg: colors.hover }}>
              Mon profil
            </MenuItem>

            <MenuDivider borderColor={colors.border} />

            <MenuItem onClick={logout} color="red.500" _hover={{ bg: colors.hover }}>
              Déconnexion
            </MenuItem>
          </MenuList>
        </Menu>
      </Center>
    </MotionBox>
  );
};

export default SideMenu;
