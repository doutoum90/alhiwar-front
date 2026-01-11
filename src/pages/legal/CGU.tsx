import { Box, Heading, Text, VStack, Divider } from "@chakra-ui/react";

export default function CGU() {
  return (
    <Box maxW="4xl" mx="auto" px={4} py={10}>
      <VStack align="stretch" spacing={6}>
        <Heading size="lg">Conditions Générales d’Utilisation</Heading>

        <Text>
          Les présentes Conditions Générales d’Utilisation (CGU) ont pour objet
          de définir les modalités d’accès et d’utilisation du site
          <strong> Journal Alhiwar</strong>.
        </Text>

        <Divider />

        <Heading size="md">Accès au site</Heading>
        <Text>
          Le site est accessible gratuitement à tout utilisateur disposant d’un accès à Internet.
          Certains services peuvent nécessiter la création d’un compte.
        </Text>

        <Divider />

        <Heading size="md">Comptes utilisateurs</Heading>
        <Text>
          L’utilisateur est responsable des informations fournies lors de la création
          de son compte et s’engage à ne pas usurper l’identité d’un tiers.
        </Text>

        <Divider />

        <Heading size="md">Règles de publication</Heading>
        <Text>
          Les utilisateurs s’engagent à publier des contenus respectueux des lois,
          sans propos diffamatoires, haineux ou contraires à l’ordre public.
        </Text>

        <Divider />

        <Heading size="md">Responsabilité</Heading>
        <Text>
          L’éditeur ne peut être tenu responsable des contenus publiés par les utilisateurs,
          mais se réserve le droit de les modérer ou supprimer.
        </Text>

        <Divider />

        <Heading size="md">Modification des CGU</Heading>
        <Text>
          Les CGU peuvent être modifiées à tout moment.
          Les utilisateurs sont invités à les consulter régulièrement.
        </Text>
      </VStack>
    </Box>
  );
}
