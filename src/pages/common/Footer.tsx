import { useMemo, useState } from "react";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  Link,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  FormControl,
  FormHelperText,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { apiFetch } from "../../services/api";
import {
  PUBLIC_MENU,
  ADDRESS,
  PHONE,
  MAIL,
  SOCIAL_MEDIA,
  OTHER_LINKS,
  COPYRIGHT,
} from "../../constantes";

export default function Footer() {
  const toast = useToast();

  const bg = useColorModeValue("white", "gray.900");
  const topBg = useColorModeValue("gray.50", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const muted = useColorModeValue("gray.600", "gray.300");

  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmailValid = useMemo(() => {
    const v = email.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }, [email]);

  const subscribe = async () => {
    const value = email.trim();

    if (!isEmailValid) {
      toast({
        title: "Email invalide",
        description: "Veuillez saisir une adresse email valide.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });

      setEmail("");

      toast({
        title: "Presque fini ✅",
        description:
          res?.message ??
          "Merci ! Vérifiez votre email pour confirmer l’inscription (double opt-in).",
        status: "success",
        duration: 4500,
        isClosable: true,
      });
    } catch (e: any) {
      toast({
        title: "Impossible de s’abonner",
        description:
          e?.message ||
          e?.response?.message ||
          "Une erreur est survenue. Réessayez.",
        status: "error",
        duration: 4500,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={16} borderTop="1px solid" borderColor={border}>
      {}
      <Box bg={topBg}>
        <Box
          maxW="7xl"
          mx="auto"
          px={{ base: 4, md: 6 }}
          py={{ base: 10, md: 12 }}
        >
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
            gap={8}
          >
            {}
            <GridItem>
              <Heading
                size="md"
                mb={3}
                color={useColorModeValue("teal.600", "teal.300")}
              >
                Alhiwar
              </Heading>

              <Text fontSize="sm" color={muted} lineHeight="tall">
                Actualités et analyses, classées par rubriques — suivez
                l’essentiel, sans bruit.
              </Text>

              <HStack mt={4} spacing={4}>
                {SOCIAL_MEDIA.map((s, idx) => (
                  <Link
                    key={idx}
                    href={s.link}
                    isExternal
                    aria-label={`social-${idx}`}
                  >
                    <Icon
                      as={s.icon}
                      boxSize={5}
                      color={useColorModeValue("gray.600", "gray.300")}
                      _hover={{
                        color: useColorModeValue("teal.600", "teal.300"),
                      }}
                    />
                  </Link>
                ))}
              </HStack>
            </GridItem>

            {}
            <GridItem>
              <Heading
                size="sm"
                mb={3}
                color={useColorModeValue("teal.600", "teal.300")}
              >
                Navigation
              </Heading>

              <Flex direction="column" gap={2}>
                {PUBLIC_MENU.map((item, idx) => (
                  <Link
                    key={idx}
                    as={RouterLink}
                    to={item.link}
                    fontSize="sm"
                    color={muted}
                    _hover={{
                      color: useColorModeValue("teal.600", "teal.300"),
                      textDecoration: "underline",
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </Flex>
            </GridItem>

            {}
            <GridItem>
              <Heading
                size="sm"
                mb={3}
                color={useColorModeValue("teal.600", "teal.300")}
              >
                Contact
              </Heading>

              <Flex direction="column" gap={3} fontSize="sm" color={muted}>
                <HStack align="start">
                  <Icon as={FaMapMarkerAlt} mt={0.5} />
                  <Text>{ADDRESS}</Text>
                </HStack>

                <HStack>
                  <Icon as={FaPhone} />
                  <Text>{PHONE}</Text>
                </HStack>

                <HStack>
                  <Icon as={FaEnvelope} />
                  <Link
                    href={`mailto:${MAIL}`}
                    _hover={{
                      color: useColorModeValue("teal.600", "teal.300"),
                    }}
                  >
                    {MAIL}
                  </Link>
                </HStack>
              </Flex>
            </GridItem>

            {}
            <GridItem>
              <Heading
                size="sm"
                mb={3}
                color={useColorModeValue("teal.600", "teal.300")}
              >
                Newsletter
              </Heading>

              <FormControl>
                <Text fontSize="sm" color={muted} mb={3}>
                  Recevez les principaux titres et analyses par email.
                </Text>

                <InputGroup>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre email"
                    bg={bg}
                    borderColor={border}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") subscribe();
                    }}
                    _focus={{
                      borderColor: "teal.400",
                      boxShadow: "0 0 0 1px var(--chakra-colors-teal-400)",
                    }}
                  />

                  <InputRightElement width="7.2rem">
                    <Button
                      h="1.9rem"
                      size="sm"
                      colorScheme="teal"
                      onClick={subscribe}
                      isLoading={loading}
                      isDisabled={!email.trim() || !isEmailValid}
                    >
                      S’abonner
                    </Button>
                  </InputRightElement>
                </InputGroup>

                <FormHelperText color={muted} mt={2}>
                  Double opt-in : une confirmation vous sera demandée.
                </FormHelperText>
              </FormControl>
            </GridItem>
          </Grid>
        </Box>
      </Box>

      {}
      <Box bg={bg}>
        <Box maxW="7xl" mx="auto" px={{ base: 4, md: 6 }} py={6}>
          <Flex
            justify="space-between"
            align="center"
            direction={{ base: "column", md: "row" }}
            gap={3}
          >
            <Text fontSize="sm" color={muted}>
              {COPYRIGHT}
            </Text>

            <HStack spacing={5} wrap="wrap" justify="center">
              {OTHER_LINKS.map((l, idx) => (
                <Link
                  key={idx}
                  as={RouterLink}
                  to={l.link}
                  fontSize="sm"
                  color={muted}
                  _hover={{ color: useColorModeValue("teal.600", "teal.300") }}
                >
                  {l.label}
                </Link>
              ))}
            </HStack>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
