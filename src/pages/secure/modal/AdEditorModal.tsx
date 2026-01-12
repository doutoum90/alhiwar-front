import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    FormControl,
    FormLabel,
    HStack,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    SimpleGrid,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    Textarea,
    useToast,
    VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import type { AdDto, AdType } from "../../../types";
import { toDateInputValue, toIsoOrNullFromDateInput, workflowColor, workflowLabel } from "../../../utils/utils";
import { adPlacementsService, type AdPlacementDto } from "../../../services/adPlacementsService";

type AdEditorForm = {
    title: string;
    content: string;
    image: string;
    link: string;
    type: AdType;
    placementKey: string;
    startDate: string;
    endDate: string;
};

function isValidHttpUrl(url: string) {
    try {
        const u = new URL(url);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

export default function AdEditorModal(props: {
    isOpen: boolean;
    onClose: () => void;
    saving: boolean;

    selectedAd: AdDto | null;

    canSave: boolean;
    onSave: (payload: {
        title: string;
        content: string;
        image: string | null;
        link: string | null;
        type: AdType;
        placementKey: string | null;
        startDate: string | null;
        endDate: string | null;
    }) => Promise<void>;
}) {
    const toast = useToast();
    const { isOpen, onClose, saving, selectedAd, canSave, onSave } = props;

    const initial: AdEditorForm = useMemo(() => {
        if (!selectedAd) {
            return {
                title: "",
                content: "",
                image: "",
                link: "",
                type: "banner",
                placementKey: "",
                startDate: "",
                endDate: "",
            };
        }
        return {
            title: selectedAd.title || "",
            content: selectedAd.content || "",
            image: String((selectedAd as any).image ?? ""),
            link: String((selectedAd as any).link ?? ""),
            type: ((selectedAd as any).type as AdType) || "banner",
            placementKey: String((selectedAd as any).placementKey ?? ""),
            startDate: toDateInputValue((selectedAd as any).startDate),
            endDate: toDateInputValue((selectedAd as any).endDate),
        };
    }, [selectedAd]);

    const [tab, setTab] = useState(0);
    const [form, setForm] = useState<AdEditorForm>(initial);

    const [placements, setPlacements] = useState<AdPlacementDto[]>([]);

    useEffect(() => {
        if (!isOpen) return;
        setTab(0);
        setForm(initial);
    }, [isOpen, initial]);

    useEffect(() => {
        if (!isOpen) return;
        (async () => {
            const list = await adPlacementsService.getAll().catch(() => [] as AdPlacementDto[]);
            setPlacements(Array.isArray(list) ? list : []);
        })();
    }, [isOpen]);

    const errors = useMemo(() => {
        const e: Record<string, string> = {};
        if (!form.title.trim()) e.title = "Titre obligatoire";
        if (!form.content.trim()) e.content = "Contenu obligatoire";
        if (form.image.trim() && !isValidHttpUrl(form.image.trim())) e.image = "URL image invalide (http/https)";
        if (form.link.trim() && !isValidHttpUrl(form.link.trim())) e.link = "URL lien invalide (http/https)";
        if (form.startDate && form.endDate && form.startDate > form.endDate) e.dates = "La date fin doit être ≥ date début";
        return e;
    }, [form]);

    const canSubmit = canSave && Object.keys(errors).length === 0;

    const preview = useMemo(() => {
        return {
            img: form.image.trim(),
            title: form.title.trim() || "Titre…",
            content: form.content.trim() || "Contenu…",
            link: form.link.trim(),
        };
    }, [form]);

    const handleSave = async () => {
        if (!canSubmit) {
            toast({
                title: "Corriger le formulaire",
                description: Object.values(errors)[0] || "Vérifie les champs",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        await onSave({
            title: form.title.trim(),
            content: form.content.trim(),
            image: form.image.trim() ? form.image.trim() : null,
            link: form.link.trim() ? form.link.trim() : null,
            type: form.type,
            placementKey: form.placementKey.trim() ? form.placementKey.trim() : null,
            startDate: toIsoOrNullFromDateInput(form.startDate),
            endDate: toIsoOrNullFromDateInput(form.endDate),
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={saving ? () => { } : onClose} size="5xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    {selectedAd ? "Modifier la publicité" : "Créer une publicité"}
                    {selectedAd?.status ? (
                        <Badge ml={3} colorScheme={workflowColor(selectedAd.status)} variant="subtle">
                            {workflowLabel(selectedAd.status)}
                        </Badge>
                    ) : null}
                </ModalHeader>
                <ModalCloseButton disabled={saving} />

                <ModalBody>
                    <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={5}>
                        <Box gridColumn={{ base: "1 / -1", lg: "1 / span 2" }}>
                            <Tabs index={tab} onChange={setTab} colorScheme="teal" variant="enclosed">
                                <TabList>
                                    <Tab>Contenu</Tab>
                                    <Tab>Média & lien</Tab>
                                    <Tab>Période & type</Tab>
                                    <Tab>Aperçu</Tab>
                                </TabList>

                                <TabPanels>
                                    <TabPanel>
                                        <VStack align="stretch" spacing={4}>
                                            <FormControl isRequired isInvalid={!!errors.title}>
                                                <FormLabel>Titre</FormLabel>
                                                <Input
                                                    value={form.title}
                                                    onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                                                    placeholder="Ex: Promo spéciale…"
                                                />
                                                {errors.title ? <Text fontSize="xs" color="red.500">{errors.title}</Text> : null}
                                            </FormControl>

                                            <FormControl isRequired isInvalid={!!errors.content}>
                                                <FormLabel>Contenu</FormLabel>
                                                <Textarea
                                                    rows={6}
                                                    value={form.content}
                                                    onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
                                                    placeholder="Message de la pub…"
                                                />
                                                {errors.content ? <Text fontSize="xs" color="red.500">{errors.content}</Text> : null}
                                            </FormControl>
                                        </VStack>
                                    </TabPanel>

                                    <TabPanel>
                                        <VStack align="stretch" spacing={4}>
                                            <FormControl isInvalid={!!errors.image}>
                                                <FormLabel>Image (URL)</FormLabel>
                                                <Input
                                                    value={form.image}
                                                    onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))}
                                                    placeholder="https://..."
                                                />
                                                {errors.image ? <Text fontSize="xs" color="red.500">{errors.image}</Text> : null}
                                            </FormControl>

                                            <FormControl isInvalid={!!errors.link}>
                                                <FormLabel>Lien (URL)</FormLabel>
                                                <Input
                                                    value={form.link}
                                                    onChange={(e) => setForm((s) => ({ ...s, link: e.target.value }))}
                                                    placeholder="https://..."
                                                />
                                                {errors.link ? <Text fontSize="xs" color="red.500">{errors.link}</Text> : null}
                                            </FormControl>

                                            <Text fontSize="sm" color="gray.600">
                                                Conseil : image 1200×630 (social) ou 728×90 / 300×250 selon l’emplacement.
                                            </Text>
                                        </VStack>
                                    </TabPanel>

                                    <TabPanel>
                                        <VStack align="stretch" spacing={4}>
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                <FormControl>
                                                    <FormLabel>Type</FormLabel>
                                                    <Select
                                                        value={form.type}
                                                        onChange={(e) => setForm((s) => ({ ...s, type: e.target.value as AdType }))}
                                                    >
                                                        <option value="banner">Bannière</option>
                                                        <option value="sidebar">Barre latérale</option>
                                                        <option value="popup">Pop-up</option>
                                                        <option value="inline">Inline</option>
                                                    </Select>
                                                </FormControl>

                                                <FormControl>
                                                    <FormLabel>Emplacement (optionnel)</FormLabel>
                                                    <Select
                                                        value={form.placementKey}
                                                        onChange={(e) => setForm((s) => ({ ...s, placementKey: e.target.value }))}
                                                    >
                                                        <option value="">— Aucun (par type) —</option>
                                                        {placements.map((p) => (
                                                            <option key={p.id} value={p.key}>
                                                                {p.name} ({p.key})
                                                            </option>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </SimpleGrid>

                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                <FormControl isInvalid={!!errors.dates}>
                                                    <FormLabel>Date début</FormLabel>
                                                    <Input
                                                        type="date"
                                                        value={form.startDate}
                                                        onChange={(e) => setForm((s) => ({ ...s, startDate: e.target.value }))}
                                                    />
                                                </FormControl>

                                                <FormControl isInvalid={!!errors.dates}>
                                                    <FormLabel>Date fin</FormLabel>
                                                    <Input
                                                        type="date"
                                                        value={form.endDate}
                                                        onChange={(e) => setForm((s) => ({ ...s, endDate: e.target.value }))}
                                                    />
                                                    {errors.dates ? <Text fontSize="xs" color="red.500">{errors.dates}</Text> : null}
                                                </FormControl>
                                            </SimpleGrid>

                                            <Text fontSize="sm" color="gray.600">
                                                Si emplacement est vide : ta logique peut diffuser par <b>type</b>.
                                            </Text>
                                        </VStack>
                                    </TabPanel>

                                    <TabPanel>
                                        <Card>
                                            <CardBody>
                                                <HStack spacing={4} align="start">
                                                    <Image
                                                        src={preview.img || undefined}
                                                        fallbackSrc="https://via.placeholder.com/320x180/CBD5E0/718096?text=Preview"
                                                        alt="preview"
                                                        borderRadius="md"
                                                        objectFit="cover"
                                                        w={{ base: "120px", md: "220px" }}
                                                        h={{ base: "80px", md: "140px" }}
                                                    />
                                                    <VStack align="start" spacing={1} flex={1}>
                                                        <Text fontWeight="bold" noOfLines={2}>
                                                            {preview.title}
                                                        </Text>
                                                        <Text fontSize="sm" color="gray.600" noOfLines={3}>
                                                            {preview.content}
                                                        </Text>
                                                        {preview.link ? (
                                                            <Badge colorScheme="blue" variant="subtle">
                                                                {preview.link}
                                                            </Badge>
                                                        ) : (
                                                            <Badge colorScheme="gray" variant="subtle">
                                                                Pas de lien
                                                            </Badge>
                                                        )}
                                                    </VStack>
                                                </HStack>
                                            </CardBody>
                                        </Card>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </Box>

                        <Box>
                            <Card>
                                <CardBody>
                                    <VStack align="stretch" spacing={3}>
                                        <Text fontWeight="semibold">Résumé</Text>

                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">Type</Text>
                                            <Badge colorScheme="blue" variant="subtle">{form.type}</Badge>
                                        </HStack>

                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">Emplacement</Text>
                                            <Badge colorScheme={form.placementKey ? "purple" : "gray"} variant="subtle">
                                                {form.placementKey || "—"}
                                            </Badge>
                                        </HStack>

                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">Début</Text>
                                            <Text fontSize="sm">{form.startDate || "—"}</Text>
                                        </HStack>

                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">Fin</Text>
                                            <Text fontSize="sm">{form.endDate || "—"}</Text>
                                        </HStack>
                                    </VStack>
                                </CardBody>
                            </Card>
                        </Box>
                    </SimpleGrid>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose} isDisabled={saving}>
                        Annuler
                    </Button>
                    <Button colorScheme="teal" onClick={handleSave} isLoading={saving} isDisabled={!canSubmit}>
                        {selectedAd ? "Mettre à jour" : "Créer (brouillon)"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
