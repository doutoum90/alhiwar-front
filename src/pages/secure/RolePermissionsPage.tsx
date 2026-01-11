import {
    Box,
    Card,
    CardBody,
    Heading,
    HStack,
    VStack,
    Text,
    Select,
    Checkbox,
    CheckboxGroup,
    Divider,
    Button,
    useToast,
    Spinner,
    useColorModeValue,
    Input,
    InputGroup,
    InputLeftElement,
    Badge,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Spacer,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { rbacService, type PermissionDto, type RoleDto } from "../../services/rbacService";

export default function RolePermissionsPage() {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [roles, setRoles] = useState<RoleDto[]>([]);
    const [permissions, setPermissions] = useState<PermissionDto[]>([]);
    const [roleId, setRoleId] = useState<string>("");

    const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
    const initialCodesRef = useRef<string[]>([]);

    const [query, setQuery] = useState("");

    const cardBg = useColorModeValue("white", "gray.800");
    const pageBg = useColorModeValue("gray.50", "gray.900");
    const muted = useColorModeValue("gray.600", "gray.300");
    const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
    const stickyBg = useColorModeValue("whiteAlpha.900", "gray.900");

    const roleKey = useMemo(() => roles.find(r => r.id === roleId)?.key ?? "", [roles, roleId]);

    const filteredPermissions = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return permissions;
        return permissions.filter(p =>
            (p.label ?? "").toLowerCase().includes(q) ||
            (p.key ?? "").toLowerCase().includes(q) ||
            (p.group ?? "").toLowerCase().includes(q)
        );
    }, [permissions, query]);

    const grouped = useMemo(() => {
        const map = new Map<string, PermissionDto[]>();
        for (const p of filteredPermissions) {
            const g = p.group || "General";
            map.set(g, [...(map.get(g) ?? []), p]);
        }
        return [...map.entries()]
            .map(([g, items]) => ({
                group: g,
                items: items.sort((a, b) => (a.label ?? "").localeCompare(b.label ?? "")),
            }))
            .sort((a, b) => a.group.localeCompare(b.group));
    }, [filteredPermissions]);

    const selectedCount = selectedCodes.length;

    const isDirty = useMemo(() => {
        const a = new Set(initialCodesRef.current);
        const b = new Set(selectedCodes);
        if (a.size !== b.size) return true;
        for (const x of a) if (!b.has(x)) return true;
        return false;
    }, [selectedCodes]);

    const toggleGroup = (group: string, checked: boolean) => {
        const keys = grouped.find((g) => g.group === group)?.items.map((x) => x.key) ?? [];
        setSelectedCodes((prev) => {
            const s = new Set(prev);
            if (checked) keys.forEach((k) => s.add(k));
            else keys.forEach((k) => s.delete(k));
            return [...s];
        });
    };

    const loadRolePermissions = async (rid: string) => {
        const codes = await rbacService.getRolePermissions(rid);
        setSelectedCodes(codes);
        initialCodesRef.current = codes;
    };

    const load = async () => {
        setLoading(true);
        try {
            const [r, p] = await Promise.all([rbacService.listRoles(), rbacService.listPermissions()]);
            const sortedRoles = [...r].sort((a, b) => a.name.localeCompare(b.name));
            setRoles(sortedRoles);
            setPermissions(p);

            const first = sortedRoles[0]?.id ?? "";
            setRoleId(first);
            if (first) await loadRolePermissions(first);
        } catch (e: any) {
            toast({ status: "error", title: "Erreur", description: e?.message ?? "Chargement impossible" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onRoleChange = async (nextRoleId: string) => {
        if (!nextRoleId) return;

        if (isDirty) {
            toast({
                status: "warning",
                title: "Modifications non enregistrées",
                description: "Enregistre ou annule avant de changer de rôle.",
                duration: 2500,
                isClosable: true,
            });
            return;
        }

        setRoleId(nextRoleId);
        setLoading(true);
        try {
            await loadRolePermissions(nextRoleId);
        } catch (e: any) {
            toast({ status: "error", title: "Erreur", description: e?.message ?? "Chargement rôle impossible" });
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setSelectedCodes(initialCodesRef.current);
    };

    const save = async () => {
        if (!roleId) return;
        setSaving(true);
        try {
            await rbacService.updateRolePermissions(roleId, selectedCodes);
            const refreshed = await rbacService.getRolePermissions(roleId);
            setSelectedCodes(refreshed);
            initialCodesRef.current = refreshed;

            toast({ status: "success", title: "Enregistré", description: "Permissions mises à jour" });
        } catch (e: any) {
            toast({ status: "error", title: "Erreur", description: e?.message ?? "Sauvegarde impossible" });
        } finally {
            setSaving(false);
        }
    };

    if (loading && roles.length === 0) {
        return (
            <Box py={20} display="flex" justifyContent="center" bg={pageBg} minH="100vh">
                <Spinner size="xl" />
            </Box>
        );
    }

    return (
        <Box bg={pageBg} minH="100vh" py={8} px={{ base: 4, md: 8 }}>
            <Box maxW="container.xl" mx="auto">
                <HStack justify="space-between" mb={6} flexWrap="wrap" gap={3}>
                    <Box>
                        <Heading size="lg">RBAC — Rôles & permissions</Heading>
                        <Text color={muted}>
                            Sélectionne un rôle puis coche ses permissions.{" "}
                            <Badge ml={2} colorScheme="teal" variant="subtle">
                                {selectedCount} sélectionnée(s)
                            </Badge>
                            {roleKey ? (
                                <Badge ml={2} variant="outline">
                                    {roleKey}
                                </Badge>
                            ) : null}
                        </Text>
                    </Box>

                    <HStack flexWrap="wrap" gap={2}>
                        <Select
                            value={roleId}
                            onChange={(e) => onRoleChange(e.target.value)}
                            minW={{ base: "240px", md: "320px" }}
                            bg={cardBg}
                            borderColor={border}
                        >
                            {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </Select>

                        <Button onClick={reset} variant="outline" isDisabled={!isDirty || loading || saving}>
                            Annuler
                        </Button>

                        <Button onClick={save} isLoading={saving} colorScheme="teal" isDisabled={!isDirty || loading}>
                            Enregistrer
                        </Button>
                    </HStack>
                </HStack>

                <Card bg={cardBg} borderWidth="1px" borderColor={border} rounded="2xl" overflow="hidden">
                    <CardBody>
                        <HStack mb={4} gap={3} flexWrap="wrap">
                            <InputGroup maxW={{ base: "100%", md: "420px" }}>
                                <InputLeftElement pointerEvents="none">
                                    <FaSearch />
                                </InputLeftElement>
                                <Input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Rechercher (label, key, groupe)…"
                                />
                            </InputGroup>

                            <Spacer />

                            {loading ? (
                                <HStack>
                                    <Spinner size="sm" />
                                    <Text color={muted}>Chargement…</Text>
                                </HStack>
                            ) : (
                                <Text color={muted} fontSize="sm">
                                    {filteredPermissions.length} permission(s) affichée(s)
                                </Text>
                            )}
                        </HStack>

                        <Divider mb={4} />

                        {loading ? (
                            <Box py={10} display="flex" justifyContent="center">
                                <Spinner />
                            </Box>
                        ) : (
                            <CheckboxGroup value={selectedCodes} onChange={(v) => setSelectedCodes(v as string[])}>
                                <Accordion allowMultiple defaultIndex={[0]}>
                                    {grouped.map(({ group, items }) => {
                                        const groupCodes = items.map((x) => x.key);
                                        const allChecked = groupCodes.length > 0 && groupCodes.every((c) => selectedCodes.includes(c));
                                        const someChecked = groupCodes.some((c) => selectedCodes.includes(c));

                                        return (
                                            <AccordionItem key={group} border="1px solid" borderColor={border} rounded="xl" mb={3} overflow="hidden">
                                                <h2>
                                                    <AccordionButton bg={useColorModeValue("gray.50", "gray.800")} _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}>
                                                        <Box flex="1" textAlign="left">
                                                            <HStack>
                                                                <Text fontWeight="700">{group}</Text>
                                                                <Badge variant="subtle">{items.length}</Badge>
                                                            </HStack>
                                                        </Box>

                                                        <Checkbox
                                                            mr={3}
                                                            isChecked={allChecked}
                                                            isIndeterminate={!allChecked && someChecked}
                                                            onChange={(e) => toggleGroup(group, e.target.checked)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            Tout
                                                        </Checkbox>

                                                        <AccordionIcon />
                                                    </AccordionButton>
                                                </h2>

                                                <AccordionPanel bg={useColorModeValue("white", "gray.900")}>
                                                    <VStack align="stretch" spacing={3}>
                                                        {items.map((p) => (
                                                            <Box key={p.key} p={3} rounded="lg" border="1px solid" borderColor={border}>
                                                                <Checkbox value={p.key}>
                                                                    <Text fontWeight="600">{p.label}</Text>
                                                                    <Text fontSize="sm" color={muted}>
                                                                        {p.key}
                                                                    </Text>
                                                                </Checkbox>
                                                            </Box>
                                                        ))}
                                                    </VStack>
                                                </AccordionPanel>
                                            </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                            </CheckboxGroup>
                        )}
                    </CardBody>
                </Card>

                {/* Sticky save bar (visible quand dirty) */}
                {isDirty ? (
                    <Box
                        position="sticky"
                        bottom={4}
                        mt={6}
                        zIndex={10}
                        bg={stickyBg}
                        borderWidth="1px"
                        borderColor={border}
                        rounded="2xl"
                        px={4}
                        py={3}
                        backdropFilter="blur(10px)"
                    >
                        <HStack>
                            <Text fontWeight="600">Modifications non enregistrées</Text>
                            <Text color={muted} fontSize="sm">
                                ({selectedCount} permission(s) sélectionnée(s))
                            </Text>
                            <Spacer />
                            <Button variant="outline" onClick={reset} isDisabled={saving}>
                                Annuler
                            </Button>
                            <Button colorScheme="teal" onClick={save} isLoading={saving}>
                                Enregistrer
                            </Button>
                        </HStack>
                    </Box>
                ) : null}
            </Box>
        </Box>
    );
}
