
import {
  Box, Card, CardBody, Heading, HStack, VStack, Text, Spinner,
  Checkbox, CheckboxGroup, Button, useToast, useColorModeValue
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { rbacService, type RoleDto } from "../../services/rbacService";

export default function UserRolesPage() {
  const { userId } = useParams();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [selectedRoleKeys, setSelectedRoleKeys] = useState<string[]>([]);

  const cardBg = useColorModeValue("white", "gray.800");
  const muted = useColorModeValue("gray.600", "gray.300");
  const border = useColorModeValue("gray.200", "gray.700");

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [allRoles, userRoles] = await Promise.all([
        rbacService.listRoles(),
        rbacService.getUserRoles(userId),
      ]);

      setRoles(allRoles);
      setSelectedRoleKeys(userRoles);
    } catch (e: any) {
      toast({ status: "error", title: "Erreur", description: e?.message ?? "Chargement impossible" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load();  }, [userId]);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await rbacService.updateUserRoles(userId, selectedRoleKeys);
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
    <Box maxW="container.md" mx="auto" py={8} px={{ base: 4, md: 8 }}>
      <HStack justify="space-between" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Heading size="lg">Rôles utilisateur</Heading>
          <Text color={muted}>Assigner un ou plusieurs rôles à l’utilisateur.</Text>
          <Text color={muted} fontSize="sm">UserId: {userId}</Text>
        </Box>

        <Button onClick={save} isLoading={saving} colorScheme="teal">
          Enregistrer
        </Button>
      </HStack>

      <Card bg={cardBg} border="1px solid" borderColor={border}>
        <CardBody>
          <CheckboxGroup value={selectedRoleKeys} onChange={(v) => setSelectedRoleKeys(v as string[])}>
            <VStack align="stretch" spacing={3}>
              {roles.map((r) => (
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
