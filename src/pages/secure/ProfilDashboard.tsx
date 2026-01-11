import {
  Box,
  Heading,
  Container,
  Card,
  CardBody,
  Avatar,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  Flex,
  Badge,
  Divider,
  SimpleGrid,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Switch,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Skeleton,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaEdit, FaCamera, FaKey, FaTrash, FaUsers, FaNewspaper, FaEye, FaCalendar } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { profileService, type ProfileDto, type NotificationsDto } from "../../services/profileService";
import type { EditFormState } from "../../types";
import { defaultNotifications, roleBadgeColor, roleText, monthsSince } from "../../utils/utils";

const ProfilDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileDto | null>(null);

  const [editForm, setEditForm] = useState<EditFormState>({
    name: "",
    username: "",
    bio: "",
    phone: "",
    location: "",
    website: "",
    company: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const notifications = useMemo<NotificationsDto>(() => {
    return profile?.notifications ?? defaultNotifications;
  }, [profile]);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const me = await profileService.getMe();
      setProfile(me);

      setEditForm({
        name: me.name ?? "",
        username: me.username ?? "",
        bio: (me.bio ?? "") as string,
        phone: (me.phone ?? "") as string,
        location: (me.location ?? "") as string,
        website: (me.website ?? "") as string,
        company: (me.company ?? "") as string,
      });
    } catch (e: any) {
      setError(e?.message || "Impossible de charger le profil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleEditSave = async () => {
    if (!profile) return;

    if (!editForm.name.trim() || !editForm.username.trim()) {
      toast({
        title: "Champs requis",
        description: "Le nom et le nom d’utilisateur sont obligatoires.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    try {
      setSavingProfile(true);
      const updated = await profileService.updateMe({
        name: editForm.name,
        username: editForm.username,
        bio: editForm.bio,
        phone: editForm.phone,
        location: editForm.location,
        website: editForm.website,
        company: editForm.company,
      });
      setProfile(updated);

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      onEditClose();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Impossible de sauvegarder le profil.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleNotificationUpdate = async (key: keyof NotificationsDto, value: boolean) => {
    if (!profile) return;
    const next = { ...notifications, [key]: value };

    setProfile((p) => (p ? { ...p, notifications: next } : p));

    try {
      setSavingNotif(true);
      const updated = await profileService.updateNotifications(next);
      setProfile(updated);
      toast({
        title: "Préférences mises à jour",
        status: "success",
        duration: 1800,
        isClosable: true,
      });
    } catch (e: any) {
      setProfile((p) => (p ? { ...p, notifications } : p));
      toast({
        title: "Erreur",
        description: e?.message || "Impossible de mettre à jour les notifications.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSavingNotif(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    try {
      setChangingPassword(true);
      await profileService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      onPasswordClose();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Impossible de changer le mot de passe.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await profileService.deleteMe();
      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé définitivement.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      window.location.href = "/login";
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Impossible de supprimer le compte.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
      onDeleteClose();
    }
  };


  const displayName = profile?.name || user?.name || "";
  const displayUsername = profile?.username || user?.username || "";
  const displayEmail = profile?.email || user?.email || "";
  const displayAvatar = profile?.avatar || user?.avatar || "";
  const displayRole = profile?.role || user?.role || "user";

  return (
    <Container maxW="container.lg" py={8}>
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <HStack justify="space-between" w="100%">
            <Text>{error}</Text>
            <Button size="sm" onClick={load}>
              Réessayer
            </Button>
          </HStack>
        </Alert>
      )}

      <Card mb={8}>
        <CardBody>
          <Flex direction={{ base: "column", md: "row" }} align="center" gap={6}>
            <Box position="relative">
              <Skeleton isLoaded={!loading} borderRadius="full">
                <Avatar size="2xl" src={displayAvatar} name={displayName} />
              </Skeleton>

              <IconButton
                icon={<FaCamera />}
                size="sm"
                colorScheme="teal"
                rounded="full"
                position="absolute"
                bottom="0"
                right="0"
                aria-label="Changer la photo"
                
                onClick={() =>
                  toast({
                    title: "Upload avatar",
                    description: "Ajoute un endpoint upload pour activer cette action.",
                    status: "info",
                    duration: 2500,
                    isClosable: true,
                  })
                }
              />
            </Box>

            <VStack align={{ base: "center", md: "start" }} flex="1" spacing={3}>
              <HStack spacing={3} align="center" wrap="wrap">
                <Skeleton isLoaded={!loading}>
                  <Heading size="lg">{displayName || "—"}</Heading>
                </Skeleton>

                <Badge colorScheme={roleBadgeColor(displayRole)} variant="subtle">
                  {roleText(displayRole)}
                </Badge>

                {(profile?.isEmailVerified ?? false) && (
                  <Badge colorScheme="green" variant="outline">
                    ✓ Vérifié
                  </Badge>
                )}
              </HStack>

              <Skeleton isLoaded={!loading}>
                <Text color="gray.600" fontSize="lg">
                  @{displayUsername || "—"}
                </Text>
              </Skeleton>

              <Skeleton isLoaded={!loading}>
                <Text maxW="md" textAlign={{ base: "center", md: "left" }}>
                  {profile?.bio ?? ""}
                </Text>
              </Skeleton>

              <HStack spacing={4}>
                <Button leftIcon={<FaEdit />} colorScheme="teal" onClick={onEditOpen} isDisabled={loading || !profile}>
                  Modifier le profil
                </Button>
                <Button leftIcon={<FaKey />} variant="outline" onClick={onPasswordOpen} isDisabled={loading || !profile}>
                  Changer le mot de passe
                </Button>
              </HStack>
            </VStack>
          </Flex>
        </CardBody>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Articles publiés</StatLabel>
              <StatNumber color="blue.500">
                {loading ? "—" : (profile?.articlesCount ?? 0)}
              </StatNumber>
              <StatHelpText>
                <FaNewspaper style={{ display: "inline", marginRight: "4px" }} />
                Contenu créé
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Abonnés</StatLabel>
              <StatNumber color="green.500">
                {loading ? "—" : (profile?.followersCount ?? 0).toLocaleString()}
              </StatNumber>
              <StatHelpText>
                <FaUsers style={{ display: "inline", marginRight: "4px" }} />
                Communauté
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Vues totales</StatLabel>
              <StatNumber color="purple.500">
                {loading ? "—" : (profile?.viewsCount ?? 0).toLocaleString()}
              </StatNumber>
              <StatHelpText>
                <FaEye style={{ display: "inline", marginRight: "4px" }} />
                Audience
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Membre depuis</StatLabel>
              <StatNumber color="orange.500">
                {loading ? "—" : `${monthsSince(profile?.joinDate)} mois`}
              </StatNumber>
              <StatHelpText>
                <FaCalendar style={{ display: "inline", marginRight: "4px" }} />
                Ancienneté
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Informations personnelles
            </Heading>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Text fontWeight="medium">Email</Text>
                <Skeleton isLoaded={!loading}>
                  <Text>{displayEmail || "—"}</Text>
                </Skeleton>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="medium">Téléphone</Text>
                <Skeleton isLoaded={!loading}>
                  <Text>{profile?.phone || "Non renseigné"}</Text>
                </Skeleton>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="medium">Localisation</Text>
                <Skeleton isLoaded={!loading}>
                  <Text>{profile?.location || "Non renseigné"}</Text>
                </Skeleton>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="medium">Site web</Text>
                <Skeleton isLoaded={!loading}>
                  <Text color="teal.500">{profile?.website || "Non renseigné"}</Text>
                </Skeleton>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="medium">Entreprise</Text>
                <Skeleton isLoaded={!loading}>
                  <Text>{profile?.company || "Non renseigné"}</Text>
                </Skeleton>
              </HStack>

              <Divider />

              <HStack justify="space-between">
                <Text fontWeight="medium">Date d'inscription</Text>
                <Skeleton isLoaded={!loading}>
                  <Text>
                    {profile?.joinDate ? new Date(profile.joinDate).toLocaleDateString("fr-FR") : "—"}
                  </Text>
                </Skeleton>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="medium">Dernière connexion</Text>
                <Skeleton isLoaded={!loading}>
                  <Text>
                    {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString("fr-FR") : "—"}
                  </Text>
                </Skeleton>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Préférences de notification
            </Heading>

            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">Notifications par email</Text>
                  <Text fontSize="sm" color="gray.600">
                    Recevoir des notifications importantes par email
                  </Text>
                </VStack>
                <Switch
                  isChecked={notifications.email}
                  isDisabled={loading || !profile || savingNotif}
                  onChange={(e) => handleNotificationUpdate("email", e.target.checked)}
                  colorScheme="teal"
                />
              </HStack>

              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">Notifications push</Text>
                  <Text fontSize="sm" color="gray.600">
                    Recevoir des notifications sur le navigateur
                  </Text>
                </VStack>
                <Switch
                  isChecked={notifications.push}
                  isDisabled={loading || !profile || savingNotif}
                  onChange={(e) => handleNotificationUpdate("push", e.target.checked)}
                  colorScheme="teal"
                />
              </HStack>

              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">Newsletter</Text>
                  <Text fontSize="sm" color="gray.600">
                    Recevoir la newsletter hebdomadaire
                  </Text>
                </VStack>
                <Switch
                  isChecked={notifications.newsletter}
                  isDisabled={loading || !profile || savingNotif}
                  onChange={(e) => handleNotificationUpdate("newsletter", e.target.checked)}
                  colorScheme="teal"
                />
              </HStack>

              <Divider />

              <Button
                leftIcon={<FaTrash />}
                colorScheme="red"
                variant="outline"
                onClick={onDeleteOpen}
                size="sm"
                isDisabled={loading || !profile}
              >
                Supprimer mon compte
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modifier le profil</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={4} width="100%">
                <FormControl isRequired>
                  <FormLabel>Nom complet</FormLabel>
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Nom d'utilisateur</FormLabel>
                  <Input
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Biographie</FormLabel>
                <Textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} />
              </FormControl>

              <SimpleGrid columns={2} spacing={4} width="100%">
                <FormControl>
                  <FormLabel>Téléphone</FormLabel>
                  <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                </FormControl>
                <FormControl>
                  <FormLabel>Localisation</FormLabel>
                  <Input
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4} width="100%">
                <FormControl>
                  <FormLabel>Site web</FormLabel>
                  <Input
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Entreprise</FormLabel>
                  <Input
                    value={editForm.company}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose} isDisabled={savingProfile}>
              Annuler
            </Button>
            <Button colorScheme="teal" onClick={handleEditSave} isLoading={savingProfile}>
              Sauvegarder
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {}
      <Modal isOpen={isPasswordOpen} onClose={onPasswordClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Changer le mot de passe</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Mot de passe actuel</FormLabel>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Nouveau mot de passe</FormLabel>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPasswordClose} isDisabled={changingPassword}>
              Annuler
            </Button>
            <Button colorScheme="teal" onClick={handlePasswordChange} isLoading={changingPassword}>
              Changer le mot de passe
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Supprimer le compte</AlertDialogHeader>
            <AlertDialogBody>
              Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose} isDisabled={deleting}>
                Annuler
              </Button>
              <Button colorScheme="red" onClick={handleDeleteAccount} ml={3} isLoading={deleting}>
                Supprimer définitivement
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default ProfilDashboard;
