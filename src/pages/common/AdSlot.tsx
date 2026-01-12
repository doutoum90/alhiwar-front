import { useEffect, useMemo, useState } from "react";
import { Box, HStack, Image, Link, Spinner, Text, VStack } from "@chakra-ui/react";
import { adsService } from "../../services/adsService";
import type { AdDto } from "../../types";
import { adPlacementsService, type AdPlacementDto } from "../../services/adPlacementsService";
import AdSenseSlot from "./AdSense";
import GamSlot from "./GamSlot";

function ManualAdSlot({ placementKey }: { placementKey: string }) {
    const [loading, setLoading] = useState(true);
    const [ad, setAd] = useState<AdDto | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const list = await adsService.getPublishedByPlacementKey(placementKey).catch(() => [] as AdDto[]);
                if (!mounted) return;
                setAd(list?.[0] ?? null); // la plus récente
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [placementKey]);

    if (loading) return <Spinner size="sm" />;
    if (!ad) return null;

    return (
        <Box borderWidth="1px" borderRadius="md" overflow="hidden">
            <HStack spacing={0} align="stretch">
                <Image
                    src={ad.image || undefined}
                    fallbackSrc="https://via.placeholder.com/200x140/CBD5E0/718096?text=Ad"
                    alt={ad.title}
                    objectFit="cover"
                    w="160px"
                    h="120px"
                />
                <VStack align="start" spacing={1} p={3} flex={1}>
                    <Text fontWeight="bold" noOfLines={1}>
                        {ad.title}
                    </Text>
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {ad.content}
                    </Text>
                    {ad.link ? (
                        <Link href={ad.link} isExternal fontSize="sm" color="teal.600">
                            En savoir plus
                        </Link>
                    ) : null}
                </VStack>
            </HStack>
        </Box>
    );
}

type Props = { placementKey: string; showLoading?: boolean };

export default function AdSlot({ placementKey, showLoading = false }: Props) {
    const [loading, setLoading] = useState(true);
    const [placements, setPlacements] = useState<AdPlacementDto[]>([]);
    const [error, setError] = useState<string | null>(null);

    const placement = useMemo(() => placements.find((p) => p.key === placementKey) ?? null, [placements, placementKey]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const list = await adPlacementsService.getActive();
                if (!mounted) return;
                setPlacements(Array.isArray(list) ? list : []);
            } catch (e: any) {
                if (!mounted) return;
                setError(e?.message || "Failed to load placements");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    if (loading && showLoading) return <Spinner />;
    if (error) return null;
    if (!placement || !placement.enabled) return null;

    if (placement.provider === "adsense") return <AdSenseSlot placement={placement} />;
    if (placement.provider === "gam") return <GamSlot placement={placement} />;

    return <ManualAdSlot placementKey={placementKey} />;
}
