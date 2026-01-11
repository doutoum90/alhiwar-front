import {
  Box,
  Heading,
  Container,
  Card,
  CardBody,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  Switch,
  Select,
  Divider,
  SimpleGrid,
  useToast,
  Badge,
  IconButton,
  useColorModeValue,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { FaSave, FaTrash, FaPlus, FaCog, FaServer, FaShieldAlt, FaEnvelope, FaDatabase, FaRedo } from "react-icons/fa";
import {
  settingsService,
  type SystemSettingsDto,
  type EmailSettingsDto,
  type SecuritySettingsDto,
  type ApiKeyDto,
  type DbStatsDto,
} from "../../services/settingsService";
import { unique, toInt, maskKey } from "../../utils/utils";

const ParametreDashboard = () => {
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.700");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [systemSettings, setSystemSettings] = useState<SystemSettingsDto>({
    siteName: "",
    siteDescription: "",
    siteUrl: "",
    adminEmail: "",
    timezone: "Europe/Paris",
    language: "fr",
    maintenanceMode: false,
    registrationEnabled: true,
    commentsEnabled: true,
    emailVerificationRequired: true,
    maxFileSize: 10,
    articlesPerPage: 20,
    sessionTimeout: 30,
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettingsDto>({
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: null,
    senderName: "",
    senderEmail: "",
    enableSSL: true,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettingsDto>({
    passwordMinLength: 8,
    requireSpecialChars: true,
    sessionDuration: 24,
    maxLoginAttempts: 5,
    twoFactorEnabled: false,
    ipWhitelist: [],
  });

  const [apiKeys, setApiKeys] = useState<ApiKeyDto[]>([]);
  const [dbStats, setDbStats] = useState<DbStatsDto | null>(null);

  const [newIpAddress, setNewIpAddress] = useState("");
  const [newApiKeyName, setNewApiKeyName] = useState("Nouvelle clé API");
  const [newApiKeyPerm, setNewApiKeyPerm] = useState<string>("read");

  const [savingSystem, setSavingSystem] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);

  const [busyBackup, setBusyBackup] = useState(false);
  const [busyOptimize, setBusyOptimize] = useState(false);
  const [busyCleanup, setBusyCleanup] = useState(false);

  const handleAuthError = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/auth/login";
  };

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [settings, keys, stats] = await Promise.all([
        settingsService.getAll(),
        settingsService.listApiKeys(),
        settingsService.getDbStats(),
      ]);

      setSystemSettings(settings.system);
      setEmailSettings({
        ...settings.email,
        smtpPassword: settings.email.smtpPassword ?? null,
      });
      setSecuritySettings(settings.security);

      setApiKeys(Array.isArray(keys) ? keys : []);
      setDbStats(stats);
    } catch (e: any) {
      if (e?.status === 401) return handleAuthError();
      setError(e?.message || "Impossible de charger les paramètres.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const dbStatusColor = useMemo(() => {
    switch (dbStats?.status) {
      case "healthy":
        return "green";
      case "degraded":
        return "orange";
      case "down":
        return "red";
      default:
        return "gray";
    }
  }, [dbStats]);

  const handleSystemSave = async () => {
    setSavingSystem(true);
    try {
      const updated = await settingsService.updateSystem(systemSettings);
      setSystemSettings(updated);
      toast({
        title: "Paramètres système sauvegardés",
        description: "La configuration a été mise à jour avec succès.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
    } catch (e: any) {
      if (e?.status === 401) return handleAuthError();
      toast({ title: "Erreur", description: e?.message || "Sauvegarde impossible.", status: "error", duration: 3000, isClosable: true });
    } finally {
      setSavingSystem(false);
    }
  };

  const handleEmailSave = async () => {
    setSavingEmail(true);
    try {
      const updated = await settingsService.updateEmail(emailSettings);
      setEmailSettings({
        ...updated,
        smtpPassword: updated.smtpPassword ?? emailSettings.smtpPassword ?? null,
      });
      toast({
        title: "Paramètres email sauvegardés",
        description: "La configuration SMTP a été mise à jour.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
    } catch (e: any) {
      if (e?.status === 401) return handleAuthError();
      toast({ title: "Erreur", description: e?.message || "Sauvegarde impossible.", status: "error", duration: 3000, isClosable: true });
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSecuritySave = async () => {
    setSavingSecurity(true);
    try {
      const updated = await settingsService.updateSecurity(securitySettings);
      setSecuritySettings(updated);
      toast({
        title: "Paramètres de sécurité sauvegardés",
        description: "Les règles de sécurité ont été mises à jour.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
    } catch (e: any) {
      if (e?.status === 401) return handleAuthError();
      toast({ title: "Erreur", description: e?.message || "Sauvegarde impossible.", status: "error", duration: 3000, isClosable: true });
    } finally {
      setSavingSecurity(false);
    }
  };

  const handleAddIpAddress = () => {
    const ip = newIpAddress.trim();
    if (!ip) return;

    if (securitySettings.ipWhitelist.includes(ip)) {
      toast({ title: "IP déjà présente", status: "info", duration: 1500, isClosable: true });
      return;
    }

    setSecuritySettings((prev) => ({
      ...prev,
      ipWhitelist: [...prev.ipWhitelist, ip],
    }));
    setNewIpAddress("");
  };

  const handleRemoveIpAddress = (ip: string) => {
    setSecuritySettings((prev) => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist.filter((x) => x !== ip),
    }));
  };

  const handleToggleApiKey = async (id: string) => {
    const current = apiKeys.find((k) => k.id === id);
    if (!current) return;

    try {
      const updated = await settingsService.toggleApiKey(id, !current.isActive);
      setApiKeys((prev) => prev.map((k) => (k.id === id ? updated : k)));
      toast({ title: "Clé API mise à jour", status: "success", duration: 2000, isClosable: true });
    } catch (e: any) {
      if (e?.status === 401) return handleAuthError();
      toast({ title: "Erreur", description: e?.message || "Action impossible.", status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    try {
      await settingsService.deleteApiKey(id);
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      toast({ title: "Clé API supprimée", status: "info", duration: 2000, isClosable: true });
    } catch (e: any) {
      if (e?.status === 401) return handleAuthError();
      toast({ title: "Erreur", description: e?.message || "Suppression impossible.", status: "error", duration: 3000, isClosable: true });
    }
  };

  const generateNewApiKey = async () => {
    try {
      const perms = unique(newApiKeyPerm.split(","));
      const created = await settingsService.createApiKey({
        name: newApiKeyName.trim() || "Nouvelle clé API",
        permissions: perms.length ? perms : ["read"],
      });

      setApiKeys((prev) => [created, ...prev]);
      toast({
        title: "Nouvelle clé API générée",
        description: created.key ? "Copie la clé maintenant (elle ne sera plus affichée ensuite)." : undefined,
        status: "success",
        duration: 3500,
        isClosable: true,
      });

      setNewApiKeyName("Nouvelle clé API");
      setNewApiKeyPerm("read");
    } catch (e: any) {
      if (e?.status === 401) return handleAuthError();
      toast({ title: "Erreur", description: e?.message || "Création impossible.", status: "error", duration: 3000, isClosable: true });
    }
  };

  const runBackup = async () => {
    setBusyBackup(true);
    try {
      const res = await settingsService.runDbBackup();
      toast({ title: "Sauvegarde créée", description: new Date(res.backupAt).toLocaleString("fr-FR"), status: "success", duration: 3000, isClosable: true });
      const stats = await settingsService.getDbStats();
      setDbStats(stats);
    } catch (e: any) {
      if (e?.status === 401) return handleAuthError();
      toast({ title: "Erreur", description: e?.message || "Backup impossible.", status: "error", duration: 3000, isClosable: true });
    } finally {
      setBusyBackup(false);
    }
  };

  const runOptimize = async () => {
    setBusyOptimize(true);
    try {
      await settingsService.runDbOptimize();
      toast({ title: "Optimisation lancée", status: "success", duration: 2500, isClosable: true });
    } catch (e: any) {
      if (e?.status === 401) return handleAuthError();
      toast({ title: "Erreur", description: e?.message || "Optimisation impossible.", status: "error", duration: 3000, isClosable: true });
    } finally {
      setBusyOptimize(false);
    }
  };

  const runCleanup = async () => {
    setBusyCleanup(true);
    try {
      await settingsService.runDbCleanupLogs();
      toast({ title: "Logs nettoyés", status: "success", duration: 2500, isClosable: true });
    } catch (e: any) {
      if (e?.status === 401) return handleAuthError();
      toast({ title: "Erreur", description: e?.message || "Nettoyage impossible.", status: "error", duration: 3000, isClosable: true });
    } finally {
      setBusyCleanup(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <Flex justify="center" py={20}>
          <Spinner size="xl" />
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
        <Heading size="lg">Paramètres de l'Application</Heading>
        <Button leftIcon={<FaRedo />} variant="outline" onClick={loadAll} isDisabled={loading}>
          Rafraîchir
        </Button>
      </Flex>

      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Tabs colorScheme="teal">
        <TabList>
          <Tab>
            <FaCog style={{ marginRight: "8px" }} />
            Général
          </Tab>
          <Tab>
            <FaEnvelope style={{ marginRight: "8px" }} />
            Email
          </Tab>
          <Tab>
            <FaShieldAlt style={{ marginRight: "8px" }} />
            Sécurité
          </Tab>
          <Tab>
            <FaServer style={{ marginRight: "8px" }} />
            API
          </Tab>
          <Tab>
            <FaDatabase style={{ marginRight: "8px" }} />
            Base de données
          </Tab>
        </TabList>

        <TabPanels>
          {/* Général */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
              <Card bg={cardBg}>
                <CardBody>
                  <Heading size="md" mb={4}>
                    Configuration du site
                  </Heading>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Nom du site</FormLabel>
                      <Input
                        value={systemSettings.siteName}
                        onChange={(e) => setSystemSettings((p) => ({ ...p, siteName: e.target.value }))}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        value={systemSettings.siteDescription}
                        onChange={(e) => setSystemSettings((p) => ({ ...p, siteDescription: e.target.value }))}
                        rows={3}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>URL du site</FormLabel>
                      <Input
                        value={systemSettings.siteUrl}
                        onChange={(e) => setSystemSettings((p) => ({ ...p, siteUrl: e.target.value }))}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Email administrateur</FormLabel>
                      <Input
                        type="email"
                        value={systemSettings.adminEmail}
                        onChange={(e) => setSystemSettings((p) => ({ ...p, adminEmail: e.target.value }))}
                      />
                    </FormControl>

                    <HStack width="100%" spacing={4}>
                      <FormControl>
                        <FormLabel>Fuseau horaire</FormLabel>
                        <Select
                          value={systemSettings.timezone}
                          onChange={(e) => setSystemSettings((p) => ({ ...p, timezone: e.target.value }))}
                        >
                          <option value="Europe/Paris">Europe/Paris</option>
                          <option value="Europe/London">Europe/London</option>
                          <option value="America/New_York">America/New_York</option>
                          <option value="Asia/Tokyo">Asia/Tokyo</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Langue</FormLabel>
                        <Select
                          value={systemSettings.language}
                          onChange={(e) => setSystemSettings((p) => ({ ...p, language: e.target.value }))}
                        >
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                          <option value="es">Español</option>
                        </Select>
                      </FormControl>
                    </HStack>

                    <Button
                      leftIcon={<FaSave />}
                      colorScheme="teal"
                      onClick={handleSystemSave}
                      width="100%"
                      isLoading={savingSystem}
                    >
                      Sauvegarder les paramètres généraux
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg}>
                <CardBody>
                  <Heading size="md" mb={4}>
                    Fonctionnalités
                  </Heading>
                  <VStack spacing={4}>
                    <HStack justify="space-between" width="100%">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">Mode maintenance</Text>
                        <Text fontSize="sm" color="gray.600">
                          Désactiver temporairement le site
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={systemSettings.maintenanceMode}
                        onChange={(e) => setSystemSettings((p) => ({ ...p, maintenanceMode: e.target.checked }))}
                        colorScheme="red"
                      />
                    </HStack>

                    <HStack justify="space-between" width="100%">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">Inscription ouverte</Text>
                        <Text fontSize="sm" color="gray.600">
                          Permettre les nouvelles inscriptions
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={systemSettings.registrationEnabled}
                        onChange={(e) => setSystemSettings((p) => ({ ...p, registrationEnabled: e.target.checked }))}
                        colorScheme="teal"
                      />
                    </HStack>

                    <HStack justify="space-between" width="100%">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">Commentaires activés</Text>
                        <Text fontSize="sm" color="gray.600">
                          Permettre les commentaires sur les articles
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={systemSettings.commentsEnabled}
                        onChange={(e) => setSystemSettings((p) => ({ ...p, commentsEnabled: e.target.checked }))}
                        colorScheme="teal"
                      />
                    </HStack>

                    <HStack justify="space-between" width="100%">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">Vérification email requise</Text>
                        <Text fontSize="sm" color="gray.600">
                          Vérifier l'email lors de l'inscription
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={systemSettings.emailVerificationRequired}
                        onChange={(e) =>
                          setSystemSettings((p) => ({ ...p, emailVerificationRequired: e.target.checked }))
                        }
                        colorScheme="teal"
                      />
                    </HStack>

                    <Divider />

                    <FormControl>
                      <FormLabel>Taille maximale des fichiers (MB)</FormLabel>
                      <NumberInput
                        value={systemSettings.maxFileSize}
                        min={1}
                        max={100}
                        onChange={(value) => setSystemSettings((p) => ({ ...p, maxFileSize: toInt(value, 10) }))}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Articles par page</FormLabel>
                      <NumberInput
                        value={systemSettings.articlesPerPage}
                        min={5}
                        max={100}
                        onChange={(value) => setSystemSettings((p) => ({ ...p, articlesPerPage: toInt(value, 20) }))}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Timeout session (minutes)</FormLabel>
                      <NumberInput
                        value={systemSettings.sessionTimeout}
                        min={5}
                        max={240}
                        onChange={(value) => setSystemSettings((p) => ({ ...p, sessionTimeout: toInt(value, 30) }))}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Email */}
          <TabPanel px={0}>
            <Card bg={cardBg} maxW="2xl">
              <CardBody>
                <Heading size="md" mb={4}>
                  Configuration SMTP
                </Heading>

                <VStack spacing={4}>
                  <HStack width="100%" spacing={4}>
                    <FormControl>
                      <FormLabel>Serveur SMTP</FormLabel>
                      <Input
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings((p) => ({ ...p, smtpHost: e.target.value }))}
                      />
                    </FormControl>
                    <FormControl maxW="120px">
                      <FormLabel>Port</FormLabel>
                      <NumberInput
                        value={emailSettings.smtpPort}
                        min={1}
                        max={65535}
                        onChange={(value) => setEmailSettings((p) => ({ ...p, smtpPort: toInt(value, 587) }))}
                      >
                        <NumberInputField />
                      </NumberInput>
                    </FormControl>
                  </HStack>

                  <HStack width="100%" spacing={4}>
                    <FormControl>
                      <FormLabel>Utilisateur SMTP</FormLabel>
                      <Input
                        value={emailSettings.smtpUser}
                        onChange={(e) => setEmailSettings((p) => ({ ...p, smtpUser: e.target.value }))}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Mot de passe SMTP</FormLabel>
                      <Input
                        type="password"
                        value={emailSettings.smtpPassword ?? ""}
                        onChange={(e) => setEmailSettings((p) => ({ ...p, smtpPassword: e.target.value }))}
                        placeholder="Laisse vide pour ne pas changer"
                      />
                    </FormControl>
                  </HStack>

                  <HStack width="100%" spacing={4}>
                    <FormControl>
                      <FormLabel>Nom de l'expéditeur</FormLabel>
                      <Input
                        value={emailSettings.senderName}
                        onChange={(e) => setEmailSettings((p) => ({ ...p, senderName: e.target.value }))}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Email de l'expéditeur</FormLabel>
                      <Input
                        type="email"
                        value={emailSettings.senderEmail}
                        onChange={(e) => setEmailSettings((p) => ({ ...p, senderEmail: e.target.value }))}
                      />
                    </FormControl>
                  </HStack>

                  <HStack justify="space-between" width="100%">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">SSL activé</Text>
                      <Text fontSize="sm" color="gray.600">
                        Utiliser une connexion SSL/TLS
                      </Text>
                    </VStack>
                    <Switch
                      isChecked={emailSettings.enableSSL}
                      onChange={(e) => setEmailSettings((p) => ({ ...p, enableSSL: e.target.checked }))}
                      colorScheme="teal"
                    />
                  </HStack>

                  <Button leftIcon={<FaSave />} colorScheme="teal" onClick={handleEmailSave} width="100%" isLoading={savingEmail}>
                    Sauvegarder les paramètres email
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Sécurité */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
              <Card bg={cardBg}>
                <CardBody>
                  <Heading size="md" mb={4}>
                    Règles de mot de passe
                  </Heading>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Longueur minimale</FormLabel>
                      <NumberInput
                        value={securitySettings.passwordMinLength}
                        min={6}
                        max={50}
                        onChange={(value) =>
                          setSecuritySettings((p) => ({ ...p, passwordMinLength: toInt(value, 8) }))
                        }
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <HStack justify="space-between" width="100%">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">Caractères spéciaux requis</Text>
                        <Text fontSize="sm" color="gray.600">
                          Exiger au moins un caractère spécial
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={securitySettings.requireSpecialChars}
                        onChange={(e) => setSecuritySettings((p) => ({ ...p, requireSpecialChars: e.target.checked }))}
                        colorScheme="teal"
                      />
                    </HStack>

                    <FormControl>
                      <FormLabel>Durée de session (heures)</FormLabel>
                      <NumberInput
                        value={securitySettings.sessionDuration}
                        min={1}
                        max={168}
                        onChange={(value) =>
                          setSecuritySettings((p) => ({ ...p, sessionDuration: toInt(value, 24) }))
                        }
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Tentatives de connexion max</FormLabel>
                      <NumberInput
                        value={securitySettings.maxLoginAttempts}
                        min={3}
                        max={10}
                        onChange={(value) =>
                          setSecuritySettings((p) => ({ ...p, maxLoginAttempts: toInt(value, 5) }))
                        }
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <HStack justify="space-between" width="100%">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">Authentification à deux facteurs</Text>
                        <Text fontSize="sm" color="gray.600">
                          Activer 2FA pour tous les utilisateurs
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={securitySettings.twoFactorEnabled}
                        onChange={(e) => setSecuritySettings((p) => ({ ...p, twoFactorEnabled: e.target.checked }))}
                        colorScheme="teal"
                      />
                    </HStack>

                    <Button leftIcon={<FaSave />} colorScheme="teal" onClick={handleSecuritySave} width="100%" isLoading={savingSecurity}>
                      Sauvegarder les paramètres de sécurité
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg}>
                <CardBody>
                  <Heading size="md" mb={4}>
                    Liste blanche d'adresses IP
                  </Heading>
                  <VStack spacing={4}>
                    <HStack width="100%">
                      <Input
                        placeholder="192.168.1.1"
                        value={newIpAddress}
                        onChange={(e) => setNewIpAddress(e.target.value)}
                      />
                      <IconButton icon={<FaPlus />} onClick={handleAddIpAddress} colorScheme="teal" aria-label="Ajouter IP" />
                    </HStack>

                    <VStack width="100%" spacing={2} align="stretch">
                      {securitySettings.ipWhitelist.length === 0 ? (
                        <Text color="gray.500" textAlign="center" py={4}>
                          Aucune adresse IP autorisée
                        </Text>
                      ) : (
                        securitySettings.ipWhitelist.map((ip) => (
                          <HStack key={ip} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                            <Text fontFamily="mono">{ip}</Text>
                            <IconButton
                              icon={<FaTrash />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleRemoveIpAddress(ip)}
                              aria-label="Supprimer IP"
                            />
                          </HStack>
                        ))
                      )}
                    </VStack>

                    <Text fontSize="sm" color="gray.600">
                      ⚠️ Pense à cliquer sur “Sauvegarder les paramètres de sécurité” pour enregistrer la whitelist.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* API */}
          <TabPanel px={0}>
            <Card bg={cardBg}>
              <CardBody>
                <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
                  <Heading size="md">Clés API</Heading>

                  <HStack>
                    <Input
                      value={newApiKeyName}
                      onChange={(e) => setNewApiKeyName(e.target.value)}
                      placeholder="Nom de la clé"
                      maxW="240px"
                    />
                    <Input
                      value={newApiKeyPerm}
                      onChange={(e) => setNewApiKeyPerm(e.target.value)}
                      placeholder="permissions: read, write"
                      maxW="220px"
                    />
                    <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={generateNewApiKey}>
                      Générer
                    </Button>
                  </HStack>
                </Flex>

                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Nom</Th>
                      <Th>Clé</Th>
                      <Th>Permissions</Th>
                      <Th>Dernière utilisation</Th>
                      <Th>Statut</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {apiKeys.map((apiKey) => (
                      <Tr key={apiKey.id}>
                        <Td fontWeight="medium">{apiKey.name}</Td>
                        <Td fontFamily="mono" fontSize="sm">
                          {apiKey.key ? apiKey.key : maskKey(apiKey.key)}
                        </Td>
                        <Td>
                          <HStack spacing={1} wrap="wrap">
                            {apiKey.permissions.map((p) => (
                              <Badge key={p} colorScheme="blue">
                                {p}
                              </Badge>
                            ))}
                          </HStack>
                        </Td>
                        <Td>
                          {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString("fr-FR") : "Jamais"}
                        </Td>
                        <Td>
                          <Badge colorScheme={apiKey.isActive ? "green" : "red"}>
                            {apiKey.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme={apiKey.isActive ? "red" : "green"}
                              onClick={() => handleToggleApiKey(apiKey.id)}
                            >
                              {apiKey.isActive ? "Désactiver" : "Activer"}
                            </Button>
                            <IconButton
                              icon={<FaTrash />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDeleteApiKey(apiKey.id)}
                              aria-label="Supprimer"
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}

                    {apiKeys.length === 0 && (
                      <Tr>
                        <Td colSpan={6}>
                          <Flex justify="center" py={8} color="gray.500">
                            Aucune clé API.
                          </Flex>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          {/* DB */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
              <Card bg={cardBg}>
                <CardBody>
                  <Heading size="md" mb={4}>
                    Sauvegarde et Maintenance
                  </Heading>

                  <VStack spacing={4} align="stretch">
                    <Alert status="info">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Maintenance</AlertTitle>
                        <AlertDescription>
                          Tu peux déclencher des opérations (backup / optimize / cleanup) via l’API.
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <Button leftIcon={<FaDatabase />} colorScheme="blue" width="100%" onClick={runBackup} isLoading={busyBackup}>
                      Créer une sauvegarde maintenant
                    </Button>

                    <Button leftIcon={<FaCog />} colorScheme="orange" width="100%" onClick={runOptimize} isLoading={busyOptimize}>
                      Optimiser la base de données
                    </Button>

                    <Button leftIcon={<FaTrash />} colorScheme="red" variant="outline" width="100%" onClick={runCleanup} isLoading={busyCleanup}>
                      Nettoyer les logs anciens
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg}>
                <CardBody>
                  <Heading size="md" mb={4}>
                    Statistiques de la base
                  </Heading>

                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between" width="100%">
                      <Text>Taille totale :</Text>
                      <Text fontWeight="bold">{(dbStats?.totalSizeMb ?? 0).toLocaleString()} MB</Text>
                    </HStack>
                    <HStack justify="space-between" width="100%">
                      <Text>Nombre d'articles :</Text>
                      <Text fontWeight="bold">{(dbStats?.totalArticles ?? 0).toLocaleString()}</Text>
                    </HStack>
                    <HStack justify="space-between" width="100%">
                      <Text>Nombre d'utilisateurs :</Text>
                      <Text fontWeight="bold">{(dbStats?.totalUsers ?? 0).toLocaleString()}</Text>
                    </HStack>
                    <HStack justify="space-between" width="100%">
                      <Text>Dernière sauvegarde :</Text>
                      <Text fontWeight="bold">
                        {dbStats?.lastBackupAt ? new Date(dbStats.lastBackupAt).toLocaleString("fr-FR") : "—"}
                      </Text>
                    </HStack>
                    <HStack justify="space-between" width="100%">
                      <Text>Statut :</Text>
                      <Badge colorScheme={dbStatusColor}>
                        {dbStats?.status === "healthy" ? "Opérationnelle" : dbStats?.status === "degraded" ? "Dégradée" : dbStats?.status === "down" ? "Indisponible" : "Inconnu"}
                      </Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default ParametreDashboard;
