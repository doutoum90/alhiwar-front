import { useMemo, useState } from "react";
import {
  Flex,
  Grid,
  GridItem,
  Text,
  Link,
  Icon,
  Box,
  Heading,
  Input,
  Button,
  FormControl,
  FormHelperText,
  InputGroup,
  InputRightElement,
  useToast,
} from "@chakra-ui/react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";

import {
  ADDRESS,
  PHONE,
  MAIL,
  SOCIAL_MEDIA,
  COPYRIGHT,
  OTHER_LINKS,
  PROTECTED_MENU,
} from "../../constantes";
import { apiFetch } from "../../services/api";

export const PrivateFooter = () => {
  /* ======================= Menu filtré ======================= */
  const footerMenu = useMemo(
    () => PROTECTED_MENU.filter((item: any) => !item?.danger && item?.name !== "Déconnexion"),
    []
  );

  /* ======================= Newsletter ======================= */
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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
        title: "Inscription réussie",
        description: res?.message ?? "Vous êtes maintenant inscrit à la newsletter Alhiwar.",
        status: "success",
        duration: 3500,
        isClosable: true,
      });
    } catch (e: any) {
      toast({
        title: "Erreur",
        description:
          e?.message ||
          e?.response?.message ||
          "Impossible de s’abonner. Veuillez réessayer.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ======================= Render ======================= */
  return (
    <Box bg="gray.800" color="white" mt={16}>
      <Flex
        direction="column"
        maxW="container.xl"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={12}
      >
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
          gap={8}
          mb={12}
        >
          {/* ===== Brand ===== */}
          <GridItem>
            <Heading size="lg" mb={4} color="teal.300">
              Alhiwar
            </Heading>
            <Text fontSize="sm" lineHeight="tall">
              Alhiwar vous propose une information structurée, des analyses et des points de vue
              sur les sujets qui comptent. Notre objectif&nbsp;: vous aider à comprendre
              l’actualité et ses enjeux au quotidien.
            </Text>
          </GridItem>

          {/* ===== Navigation ===== */}
          <GridItem>
            <Heading size="md" mb={4} color="teal.300">
              Navigation
            </Heading>
            <Flex direction="column">
              {footerMenu.map((btn: any, index: number) => (
                <Link
                  key={index}
                  href={btn.path}
                  mb={2}
                  _hover={{ color: "teal.400", textDecoration: "underline" }}
                >
                  {btn.name}
                </Link>
              ))}
            </Flex>
          </GridItem>

          {/* ===== Contact ===== */}
          <GridItem>
            <Heading size="md" mb={4} color="teal.300">
              Contact
            </Heading>
            <Flex direction="column" gap={3}>
              <Flex align="center">
                <Icon as={FaMapMarkerAlt} mr={3} />
                <Text>{ADDRESS}</Text>
              </Flex>

              <Flex align="center">
                <Icon as={FaPhone} mr={3} />
                <Text>{PHONE}</Text>
              </Flex>

              <Flex align="center">
                <Icon as={FaEnvelope} mr={3} />
                <Link href={`mailto:${MAIL}`} _hover={{ color: "teal.400" }}>
                  {MAIL}
                </Link>
              </Flex>
            </Flex>
          </GridItem>

          {/* ===== Newsletter + Social ===== */}
          <GridItem>
            <Heading size="md" mb={4} color="teal.300">
              Newsletter
            </Heading>

            <FormControl>
              <Text fontSize="sm" color="gray.200" mb={3}>
                Recevez les principaux titres et analyses directement par email.
              </Text>

              <InputGroup>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email"
                  bg="whiteAlpha.100"
                  borderColor="whiteAlpha.300"
                  _placeholder={{ color: "whiteAlpha.700" }}
                  _focus={{
                    borderColor: "teal.400",
                    boxShadow: "0 0 0 1px var(--chakra-colors-teal-400)",
                  }}
                />

                <InputRightElement width="7rem">
                  <Button
                    h="1.9rem"
                    size="sm"
                    colorScheme="teal"
                    isLoading={loading}
                    onClick={subscribe}
                    isDisabled={!email.trim()}
                  >
                    S’abonner
                  </Button>
                </InputRightElement>
              </InputGroup>

              <FormHelperText color="gray.300" mt={2}>
                Vous pourrez vous désinscrire à tout moment.
              </FormHelperText>
            </FormControl>

            <Heading size="sm" mt={6} mb={3} color="teal.300">
              Suivez-nous
            </Heading>

            <Flex gap={4}>
              {SOCIAL_MEDIA.map((social, index) => (
                <Link key={index} href={social.link} isExternal>
                  <Icon
                    as={social.icon}
                    boxSize={6}
                    _hover={{ color: "teal.400", cursor: "pointer" }}
                  />
                </Link>
              ))}
            </Flex>
          </GridItem>
        </Grid>

        {/* ===== Bottom bar ===== */}
        <Flex
          borderTop="1px solid"
          borderColor="gray.700"
          pt={8}
          justify="space-between"
          direction={{ base: "column", md: "row" }}
          align="center"
          gap={4}
        >
          <Text fontSize="sm" color="gray.400">
            {COPYRIGHT}
          </Text>

          <Flex gap={6} wrap="wrap">
            {OTHER_LINKS.map((link, index) => (
              <Link
                key={index}
                href={link.link}
                fontSize="sm"
                _hover={{ color: "teal.400" }}
              >
                {link.label}
              </Link>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};
