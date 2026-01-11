// src/pages/secure/UserRightsPage.tsx
import {
    Box, Card, CardBody, Heading, HStack, VStack, Text, Checkbox, CheckboxGroup,
    Button, useToast, Spinner, useColorModeValue
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { rbacService, type RoleDto } from "../../services/rbacService";
import { useAuth } from "../../contexts/AuthContext";

export default function UserRightsPage() {

    const { user } = useAuth()
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [roles, setRoles] = useState<RoleDto[]>([]);
    const [selectedRoleKeys, setSelectedRoleKeys] = useState<string[]>([]);

    const cardBg = useColorModeValue("white", "gray.800");
    const muted = useColorModeValue("gray.600", "gray.300");
    const border = useColorModeValue("gray.200", "gray.700");

    const sortedRoles = useMemo(
        () => [...roles].sort((a, b) => a.key.localeCompare(b.key)),
        [roles]
    );

    const load = async () => {
        if (!user?.userId) return;
        setLoading(true);
        try {
            const [allRoles, userRoleKeys] = await Promise.all([
                rbacService.listRoles(),
                rbacService.getUserRoles(user?.userId), // ✅ string[]
            ]);

            setRoles(allRoles);
            setSelectedRoleKeys(userRoleKeys); // ✅
        } catch (e: any) {
            toast({ status: "error", title: "Erreur", description: e?.message ?? "Chargement impossible" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.userId]);

    const save = async () => {
        if (!user?.userId) return;
        setSaving(true);
        try {
            await rbacService.updateUserRoles(user?.userId, selectedRoleKeys); // ✅
            toast({ status: "success", title: "Enregistré", description: "Rôles utilisateur mis à jour" });
        } catch (e: any) {
            toast({ status: "error", title: "Erreur", description: e?.message ?? "Sauvegarde impossible" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box py={20} display="flex" justifyContent="center">
                <Spinner size="xl" />
            </Box>
        );
    }

    return (
        <Box maxW="container.lg" mx="auto" py={8} px={{ base: 4, md: 8 }}>
            <HStack justify="space-between" mb={6} flexWrap="wrap" gap={3}>
                <Box>
                    <Heading size="lg">Droits utilisateur</Heading>
                    <Text color={muted}>Assigne un ou plusieurs rôles à l’utilisateur.</Text>
                    <Text color={muted} fontSize="sm">UserId: {user?.userId}</Text>
                </Box>

                <Button onClick={save} isLoading={saving} colorScheme="teal">
                    Enregistrer
                </Button>
            </HStack>

            <Card bg={cardBg} border="1px solid" borderColor={border}>
                <CardBody>
                    <CheckboxGroup
                        value={selectedRoleKeys}
                        onChange={(v) => setSelectedRoleKeys(v as string[])}
                    >
                        <VStack align="stretch" spacing={2}>
                            {sortedRoles.map((r) => (
                                <Checkbox key={r.id} value={r.key}>
                                    <Text fontWeight="medium">{r.name}</Text>
                                    <Text fontSize="sm" color={muted}>{r.key}</Text>
                                </Checkbox>
                            ))}
                        </VStack>
                    </CheckboxGroup>
                </CardBody>
            </Card>
        </Box>
    );
}
