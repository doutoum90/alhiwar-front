// src/pages/secure/UserDashboard.tsx
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
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  SimpleGrid,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { FaEllipsisV, FaPlus, FaRedo, FaSearch } from "react-icons/fa";
import FilterBar from "../ui/FilterBar";
import { usersService, type UserDto } from "../../services/userService";
import { normalize, roleLabel, statusColor, statusLabel } from "../../utils/utils";

export default function UserDashboard() {
  const toast = useToast();

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const muted = useColorModeValue("gray.600", "gray.300");

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserDto[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "editor" | "user">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "suspended">("all");

  const loadAll = async () => {
    setLoading(true);
    try {
      const list = await usersService.getUsers();
      setUsers(Array.isArray(list) ? list : []);
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Impossible de charger les utilisateurs",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = normalize(searchTerm);

    return users.filter((u: any) => {
      const name = normalize(`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim());
      const email = normalize(String(u.email ?? ""));
      const role = normalize(String(u.role ?? ""));
      const status = normalize(String(u.status ?? ""));

      const matchesSearch = !q || name.includes(q) || email.includes(q) || role.includes(q) || status.includes(q);
      const matchesRole = filterRole === "all" ? true : role === filterRole;
      const matchesStatus = filterStatus === "all" ? true : status === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  const onCreate = () => {
    toast({ title: "TODO: Create user", status: "info", duration: 2000, isClosable: true });
  };

  const onEdit = (u: UserDto) => {
    toast({ title: `TODO: Edit ${u.email}`, status: "info", duration: 2000, isClosable: true });
  };

  const onDisable = async (u: UserDto) => {
    toast({ title: `TODO: Disable ${u.email}`, status: "info", duration: 2000, isClosable: true });
  };

  return (
    <Box bg={pageBg} minH="calc(100vh - 120px)" p={{ base: 4, md: 6 }}>
      <Box maxW="7xl" mx="auto">
        <Card bg={cardBg} borderWidth="1px" borderColor={border} rounded="2xl">
          <CardBody>
            <Flex justify="space-between" align={{ base: "start", md: "center" }} wrap="wrap" gap={4}>
              <Box>
                <Heading size="lg">Users</Heading>
                <Text mt={1} color={muted}>
                  Gestion des utilisateurs
                </Text>
              </Box>

              <HStack>
                <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={onCreate}>
                  Nouvel utilisateur
                </Button>
                <Button leftIcon={<FaRedo />} variant="outline" onClick={loadAll} isDisabled={loading}>
                  Rafraîchir
                </Button>
              </HStack>
            </Flex>

            <Divider my={5} />

            {/* ✅ FilterBar only */}
            <FilterBar
              mb={5}
              left={
                <InputGroup maxW="520px">
                  <InputLeftElement>
                    <FaSearch />
                  </InputLeftElement>
                  <Input
                    placeholder="Rechercher des utilisateurs (nom, email, rôle, statut)…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              }
              right={
                <SimpleGrid
                  columns={{ base: 2, md: 2 }}
                  spacing={3}
                  minW={{ base: "full", md: "auto" }}
                  w={{ base: "full", md: "auto" }}
                >
                  <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value as any)}>
                    <option value="all">Tous les rôles</option>
                    <option value="admin">Administrateur</option>
                    <option value="editor">Éditeur</option>
                    <option value="user">Utilisateur</option>
                  </Select>

                  <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="suspended">Suspendu</option>
                  </Select>
                </SimpleGrid>
              }
            />

            <Card borderWidth="1px" borderColor={border} rounded="2xl">
              <CardBody p={0}>
                {loading ? (
                  <Flex py={12} justify="center">
                    <Spinner />
                  </Flex>
                ) : (
                  <>
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Utilisateur</Th>
                            <Th>Email</Th>
                            <Th>Rôle</Th>
                            <Th>Statut</Th>
                            <Th textAlign="right">Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filtered.map((u: any) => (
                            <Tr key={u.id}>
                              <Td>
                                <Text fontWeight="semibold" noOfLines={1}>
                                  {`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "—"}
                                </Text>
                              </Td>
                              <Td>{u.email}</Td>
                              <Td>
                                <Badge variant="subtle" colorScheme="blue">
                                  {roleLabel(u.role)}
                                </Badge>
                              </Td>
                              <Td>
                                <Badge colorScheme={statusColor(u.status)}>{statusLabel(u.status)}</Badge>
                              </Td>
                              <Td textAlign="right">
                                <Menu>
                                  <MenuButton
                                    as={IconButton}
                                    icon={<FaEllipsisV />}
                                    variant="ghost"
                                    size="sm"
                                    aria-label="Actions"
                                  />
                                  <MenuList>
                                    <MenuItem onClick={() => onEdit(u)}>Modifier</MenuItem>
                                    <MenuItem onClick={() => onDisable(u)} color="red.500">
                                      Désactiver
                                    </MenuItem>
                                  </MenuList>
                                </Menu>
                              </Td>
                            </Tr>
                          ))}

                          {filtered.length === 0 ? (
                            <Tr>
                              <Td colSpan={5}>
                                <Flex py={10} justify="center" color="gray.500">
                                  Aucun utilisateur
                                </Flex>
                              </Td>
                            </Tr>
                          ) : null}
                        </Tbody>
                      </Table>
                    </Box>

                    <Divider my={5} />
                    <Flex justify="space-between" align="center" px={4} pb={4} color={muted} fontSize="sm" wrap="wrap" gap={3}>
                      <Text>Total : {filtered.length}</Text>
                    </Flex>
                  </>
                )}
              </CardBody>
            </Card>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}
