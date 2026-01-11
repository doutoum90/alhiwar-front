import {
  Heading,
  Text,
  Box,
  Button,
  Textarea,
  HStack,
  VStack,
  GridItem,
  Grid,
  Flex,
  Icon,
  Input,
  FormControl,
  FormLabel,
  Link,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaPaperPlane } from "react-icons/fa";
import { ADDRESS, MAIL, PHONE, SOCIAL_MEDIA } from "../constantes";
import { useContactForm } from "../hooks/useContactForm";

export const Contact = () => {
  const { formData, isSubmitting, canSubmit, handleInputChange, handleSubmit } = useContactForm();

  const pageBg = useColorModeValue("linear(to-br, gray.50, blue.50)", "linear(to-br, gray.900, gray.800)");
  const cardBg = useColorModeValue("white", "gray.900");
  const muted = useColorModeValue("gray.600", "gray.300");
  const titleGrad = useColorModeValue("linear(to-r, teal.600, blue.500)", "linear(to-r, teal.300, blue.300)");

  return (
    <Flex minH="100vh" bgGradient={pageBg} py={16} px={{ base: 4, md: 8 }} align="center">
      <Box maxW="container.xl" mx="auto" width="100%">
        <Box
          opacity={0}
          animation="fadeInUp 500ms ease forwards"
          sx={{
            "@keyframes fadeInUp": {
              from: { opacity: 0, transform: "translateY(12px)" },
              to: { opacity: 1, transform: "translateY(0px)" },
            },
          }}
        >
          <Heading as="h1" size="2xl" textAlign="center" mb={12} bgGradient={titleGrad} bgClip="text">
            Contactez-nous
          </Heading>

          <Grid
            templateColumns={{ base: "1fr", md: "1fr 1fr" }}
            gap={12}
            bg={cardBg}
            borderRadius="2xl"
            p={{ base: 6, md: 8 }}
            boxShadow="xl"
          >
            {}
            <GridItem>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel>Votre nom</FormLabel>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Jean Dupont"
                      focusBorderColor="teal.500"
                      size="lg"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Adresse email</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="contact@exemple.com"
                      focusBorderColor="teal.500"
                      size="lg"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Sujet</FormLabel>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Demande de renseignement"
                      focusBorderColor="teal.500"
                      size="lg"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Message</FormLabel>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Décrivez votre demande..."
                      focusBorderColor="teal.500"
                      size="lg"
                      minH="200px"
                    />
                    <Text mt={2} fontSize="sm" color={muted}>
                      Astuce : indiquez le contexte et votre besoin, on vous répond plus vite 🙂
                    </Text>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="teal"
                    size="lg"
                    width="100%"
                    isLoading={isSubmitting}
                    loadingText="Envoi en cours..."
                    rightIcon={<FaPaperPlane />}
                    isDisabled={!canSubmit}
                    _hover={{ transform: "translateY(-1px)" }}
                    transition="all 0.2s"
                  >
                    Envoyer le message
                  </Button>
                </VStack>
              </form>
            </GridItem>

            {}
            <GridItem>
              <VStack spacing={8} align="start" height="100%">
                <Box>
                  <Heading size="md" mb={4} color={useColorModeValue("teal.600", "teal.300")}>
                    Nos coordonnées
                  </Heading>

                  <VStack spacing={6} align="start" color={muted}>
                    <HStack align="start">
                      <Icon
                        as={FaMapMarkerAlt}
                        boxSize={6}
                        color={useColorModeValue("teal.600", "teal.300")}
                        mt={0.5}
                      />
                      <Text fontSize="lg">{ADDRESS}</Text>
                    </HStack>

                    <HStack>
                      <Icon as={FaPhone} boxSize={6} color={useColorModeValue("teal.600", "teal.300")} />
                      <Text fontSize="lg">{PHONE}</Text>
                    </HStack>

                    <HStack>
                      <Icon as={FaEnvelope} boxSize={6} color={useColorModeValue("teal.600", "teal.300")} />
                      <Link
                        href={`mailto:${MAIL}`}
                        fontSize="lg"
                        _hover={{ color: useColorModeValue("teal.600", "teal.300") }}
                      >
                        {MAIL}
                      </Link>
                    </HStack>
                  </VStack>
                </Box>

                {}
                <Box w="100%">
                  <Heading size="sm" mb={3} color={useColorModeValue("teal.600", "teal.300")}>
                    Suivez-nous
                  </Heading>

                  <HStack spacing={5}>
                    {SOCIAL_MEDIA.map((s, idx) => (
                      <Link key={idx} href={s.link} isExternal aria-label={`social-${idx}`}>
                        <Icon
                          as={s.icon}
                          boxSize={7}
                          color={useColorModeValue("gray.600", "gray.300")}
                          _hover={{ color: useColorModeValue("teal.600", "teal.300") }}
                        />
                      </Link>
                    ))}
                  </HStack>
                </Box>
              </VStack>
            </GridItem>
          </Grid>
        </Box>
      </Box>
    </Flex>
  );
};

export default Contact;
