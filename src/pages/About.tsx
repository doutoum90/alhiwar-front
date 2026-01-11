import {
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  VStack,
  Container,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import { useAbout } from "../hooks/useAbout";

export const About = () => {
  const { titles, paragraphs } = useAbout();

  const titleColor = useColorModeValue("gray.800", "gray.100");
  const subtitleColor = useColorModeValue("gray.600", "gray.300");

  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const cardShadow = useColorModeValue("sm", "lg");

  const btnHoverBg = useColorModeValue("teal.50", "whiteAlpha.100");
  const btnActiveBg = useColorModeValue("teal.100", "whiteAlpha.200");

  const panelBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const sectionTitle = useColorModeValue("teal.700", "teal.200");
  const sectionDesc = useColorModeValue("gray.600", "gray.300");

  return (
    <Box w="100%" pt={{ base: 10, md: 14 }} px={{ base: 4, md: 8 }}>
      <Container maxW="container.xl" p={0}>
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          <VStack spacing={2} textAlign="center">
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color={titleColor}>
              {titles.title}
            </Text>
            <Text fontSize={{ base: "md", md: "lg" }} color={subtitleColor} maxW="70ch">
              {titles.subtitle}
            </Text>
          </VStack>

          <Accordion allowToggle w="100%">
            {paragraphs.map((paragraph, index) => (
              <AccordionItem
                key={index}
                border="1px solid"
                borderColor={cardBorder}
                bg={cardBg}
                borderRadius="2xl"
                overflow="hidden"
                boxShadow={cardShadow}
                mb={5}
              >
                <h2>
                  <AccordionButton
                    py={{ base: 4, md: 5 }}
                    px={{ base: 4, md: 6 }}
                    _hover={{ bg: btnHoverBg }}
                    _expanded={{ bg: btnActiveBg }}
                    _focusVisible={{
                      outline: "2px solid",
                      outlineColor: useColorModeValue("teal.400", "teal.300"),
                      outlineOffset: "2px",
                    }}
                    transition="background 0.15s ease"
                  >
                    <Box flex="1" textAlign="left">
                      <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold" color={titleColor}>
                        {paragraph.title}
                      </Text>
                      { }
                      { }
                      <Text fontSize="sm" color={subtitleColor} mt={1}>Cliquez pour afficher</Text>
                    </Box>

                    <AccordionIcon
                      color={useColorModeValue("teal.600", "teal.200")}
                      boxSize={7}
                    />
                  </AccordionButton>
                </h2>

                <AccordionPanel px={{ base: 4, md: 6 }} pb={{ base: 4, md: 6 }} pt={0}>
                  <Box
                    mt={3}
                    bg={panelBg}
                    border="1px solid"
                    borderColor={cardBorder}
                    borderRadius="xl"
                    p={{ base: 4, md: 5 }}
                  >
                    <VStack spacing={5} align="stretch">
                      {paragraph.sousParagraphs.map((sp, spIndex) => (
                        <Box key={spIndex}>
                          <Text fontWeight="700" fontSize={{ base: "md", md: "lg" }} color={sectionTitle}>
                            {sp.title}
                          </Text>
                          <Divider my={2} borderColor={useColorModeValue("gray.200", "whiteAlpha.200")} />
                          <Text color={sectionDesc} lineHeight="1.8">
                            {sp.description}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </VStack>
      </Container>
    </Box>
  );
};

export default About;
