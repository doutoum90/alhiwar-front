
import {
  Box,
  Heading,
  Container,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Text,
  Progress,
  Flex,
  Icon,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Button,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { FaUsers, FaNewspaper, FaEye, FaHeart, FaShare, FaComment, FaChartLine, FaMobile, FaDesktop, FaGlobe, FaRedo } from "react-icons/fa";
import { statsService } from "../../services/statsService";
import type { AdsByTypeDto, DashboardStatsDto, Period, TopAdDto } from "../../types";

const StatDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dash, setDash] = useState<DashboardStatsDto | null>(null);

  const cardBg = useColorModeValue("white", "gray.700");
  const statBg = useColorModeValue("gray.50", "gray.600");

  const fetchAll = async (period: Period) => {
    setLoading(true);
    setError(null);

    try {
      const d = await statsService.getDashboard(period, { topAdsLimit: 10 });
      setDash(d);
    } catch (e: any) {
      setError(e?.message || "Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(selectedPeriod);
    
  }, [selectedPeriod]);

  const StatCard = ({
    title,
    value,
    icon,
    growth,
    color,
  }: {
    title: string;
    value: string | number;
    icon: any;
    growth?: number | null;
    color: string;
  }) => (
    <Card bg={cardBg} boxShadow="md">
      <CardBody>
        <Flex justify="space-between" align="center" mb={2}>
          <Stat>
            <StatLabel fontSize="sm" color="gray.600" fontWeight="medium">
              {title}
            </StatLabel>

            <StatNumber fontSize="2xl" fontWeight="bold" color={color}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </StatNumber>

            {growth !== undefined && growth !== null && !Number.isNaN(growth) ? (
              <StatHelpText mb={0}>
                <StatArrow type={growth >= 0 ? "increase" : "decrease"} />
                {Math.abs(growth).toFixed(1)}%
              </StatHelpText>
            ) : null}
          </Stat>

          <Box p={3} borderRadius="lg" bg={`${String(color).split(".")[0]}.100`}>
            <Icon as={icon} boxSize={6} color={color} />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );

  
  const usersTotal = dash?.users?.total ?? 0;
  const usersActive = dash?.users?.active ?? 0;

  const articlesSummary = dash?.articles ?? null;
  const publishedArticles = articlesSummary?.publishedArticles ?? 0;
  const totalViews = articlesSummary?.totalViews ?? 0;
  const totalLikes = articlesSummary?.totalLikes ?? 0;
  const totalComments = articlesSummary?.totalComments ?? 0;

  
  const usersGrowth = (dash?.users as any)?.usersGrowth ?? undefined;
  const articlesGrowth = articlesSummary?.articlesGrowth ?? undefined;
  const viewsGrowth = articlesSummary?.viewsGrowth ?? undefined;

  
  const monthlyGrowth = (articlesSummary as any)?.monthlyGrowth ?? 0;

  
  const ads = dash?.adsSummary ?? null;
  const topAds = dash?.topAds ?? [];
  const adsByType = dash?.adsByType ?? [];

  
  const unreadContact = dash?.contactUnread?.count ?? 0;

  
  const newsletterActive = dash?.newsletter?.active ?? 0;
  const newsletterTotal = dash?.newsletter?.total ?? 0;

  
  
  

  const deviceIcon = (device: string) => {
    const d = (device || "").toLowerCase();
    if (d.includes("desktop")) return FaDesktop;
    if (d.includes("mobile")) return FaMobile;
    return FaGlobe;
  };

  
  const adsTypeBars = useMemo(() => {
    return adsByType.map((x: AdsByTypeDto) => {
      const ctr = Number(x.ctr ?? 0);
      return {
        label: x.type,
        pct: Math.max(0, Math.min(100, ctr)),
        impressions: Number(x.impressions ?? 0),
        clicks: Number(x.clicks ?? 0),
      };
    });
  }, [adsByType]);

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={8} gap={3} flexWrap="wrap">
        <Heading size="lg">Statistiques et Analytics</Heading>

        <HStack>
          <Select maxW="220px" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value as Period)}>
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">3 derniers mois</option>
            <option value="365">12 derniers mois</option>
          </Select>

          <Button leftIcon={<FaRedo />} variant="outline" onClick={() => fetchAll(selectedPeriod)} isDisabled={loading}>
            Rafraîchir
          </Button>
        </HStack>
      </Flex>

      {error ? (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      ) : null}

      {loading && !dash ? (
        <Flex align="center" justify="center" py={16}>
          <Spinner size="xl" />
        </Flex>
      ) : null}

      {}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard title="Utilisateurs total" value={usersTotal} icon={FaUsers} growth={usersGrowth} color="blue.500" />
        <StatCard
          title="Articles publies"
          value={publishedArticles}
          icon={FaNewspaper}
          growth={articlesGrowth}
          color="green.500"
        />
        <StatCard title="Vues total" value={totalViews} icon={FaEye} growth={viewsGrowth} color="purple.500" />
        <StatCard
          title="Croissance (indicative)"
          value={`${Number(monthlyGrowth || 0).toFixed(1)}%`}
          icon={FaChartLine}
          color="orange.500"
        />
      </SimpleGrid>

      {}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Likes total</StatLabel>
              <StatNumber color="pink.500">{Number(totalLikes).toLocaleString()}</StatNumber>
              <Flex align="center" mt={2}>
                <Icon as={FaHeart} color="pink.500" mr={2} />
                <Text fontSize="sm" color="gray.600">
                  Engagement
                </Text>
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Commentaires</StatLabel>
              <StatNumber color="yellow.500">{Number(totalComments).toLocaleString()}</StatNumber>
              <Flex align="center" mt={2}>
                <Icon as={FaComment} color="yellow.500" mr={2} />
                <Text fontSize="sm" color="gray.600">
                  Communaute
                </Text>
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Messages non lus</StatLabel>
              <StatNumber color="red.500">{Number(unreadContact).toLocaleString()}</StatNumber>
              <Flex align="center" mt={2}>
                <Icon as={FaShare} color="red.500" mr={2} />
                <Text fontSize="sm" color="gray.600">
                  Contact
                </Text>
              </Flex>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
        <Card bg={cardBg}>
          <CardBody>
            <Heading size="md" mb={4}>
              Top publicites
            </Heading>

            {topAds.length === 0 ? (
              <Text color="gray.500">Aucune publicite.</Text>
            ) : (
              <VStack spacing={4} align="stretch">
                {topAds.slice(0, 5).map((ad: TopAdDto, index: number) => (
                  <Box key={ad.id} p={4} bg={statBg} borderRadius="md">
                    <Flex justify="space-between" align="start" mb={2}>
                      <Box flex="1" mr={4}>
                        <Text fontWeight="semibold" noOfLines={2} mb={1}>
                          {index + 1}. {ad.title}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Type: {ad.type}
                        </Text>
                      </Box>
                      <Badge colorScheme="blue" variant="subtle">
                        #{index + 1}
                      </Badge>
                    </Flex>

                    <HStack spacing={4} fontSize="sm" color="gray.600">
                      <Flex align="center">
                        <Icon as={FaEye} mr={1} />
                        <Text>{Number(ad.impressions ?? 0).toLocaleString()}</Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaShare} mr={1} />
                        <Text>{Number(ad.clicks ?? 0).toLocaleString()}</Text>
                      </Flex>
                      <Badge colorScheme="green">{Number(ad.ctr ?? 0).toFixed(2)}%</Badge>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}

            {ads ? (
              <Box mt={6}>
                <Text fontSize="sm" color="gray.600">
                  Impressions: {Number(ads.totalImpressions ?? 0).toLocaleString()} · Clicks:{" "}
                  {Number(ads.totalClicks ?? 0).toLocaleString()} · CTR moyen: {Number(ads.avgCtr ?? 0).toFixed(2)}%
                </Text>
              </Box>
            ) : null}
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Heading size="md" mb={4}>
              Publicites par type (CTR)
            </Heading>

            {adsTypeBars.length === 0 ? (
              <Text color="gray.500">Aucune statistique par type.</Text>
            ) : (
              <VStack spacing={4}>
                {adsTypeBars.map((d, idx) => (
                  <Box key={`${d.label}-${idx}`} width="100%">
                    <Flex justify="space-between" mb={2}>
                      <HStack>
                        <Icon as={deviceIcon(d.label)} color="gray.600" />
                        <Text fontWeight="medium">{d.label}</Text>
                      </HStack>
                      <Text fontWeight="bold">{Math.round(d.pct)}%</Text>
                    </Flex>
                    <Progress value={d.pct} size="md" borderRadius="full" />
                    <Text mt={2} fontSize="sm" color="gray.600">
                      Impressions: {d.impressions.toLocaleString()} · Clicks: {d.clicks.toLocaleString()}
                    </Text>
                  </Box>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      {}
      <Card bg={cardBg} mb={8}>
        <CardBody>
          <Heading size="md" mb={4}>
            Newsletter
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card bg={statBg}>
              <CardBody>
                <Stat>
                  <StatLabel>Total</StatLabel>
                  <StatNumber>{Number(newsletterTotal).toLocaleString()}</StatNumber>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={statBg}>
              <CardBody>
                <Stat>
                  <StatLabel>Actifs</StatLabel>
                  <StatNumber color="green.500">{Number(newsletterActive).toLocaleString()}</StatNumber>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={statBg}>
              <CardBody>
                <Stat>
                  <StatLabel>Utilisateurs actifs</StatLabel>
                  <StatNumber color="blue.500">{Number(usersActive).toLocaleString()}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        </CardBody>
      </Card>

      {}
      <Card bg={cardBg}>
        <CardBody>
          <Heading size="md" mb={4}>
            Detail publicites par type
          </Heading>

          {adsByType.length === 0 ? (
            <Text color="gray.500">Aucune donnee.</Text>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Type</Th>
                  <Th isNumeric>Impressions</Th>
                  <Th isNumeric>Clicks</Th>
                  <Th isNumeric>CTR</Th>
                  <Th isNumeric>Revenu</Th>
                </Tr>
              </Thead>
              <Tbody>
                {adsByType.map((row: AdsByTypeDto, index: number) => (
                  <Tr key={`${row.type}-${index}`}>
                    <Td fontWeight="medium">{row.type}</Td>
                    <Td isNumeric>{Number(row.impressions ?? 0).toLocaleString()}</Td>
                    <Td isNumeric>{Number(row.clicks ?? 0).toLocaleString()}</Td>
                    <Td isNumeric>
                      <Badge colorScheme={Number(row.ctr ?? 0) >= 1 ? "green" : "gray"}>{Number(row.ctr ?? 0).toFixed(2)}%</Badge>
                    </Td>
                    <Td isNumeric>{Number(row.revenue ?? 0).toLocaleString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </Container>
  );
};

export default StatDashboard;
