import { Box, Heading, Text, VStack, Divider } from "@chakra-ui/react";

export default function MentionsLegales() {
    return (
        <Box maxW="4xl" mx="auto" px={4} py={10}>
            <VStack align="stretch" spacing={6}>
                <Heading size="lg">Mentions légales</Heading>

                <Text>
                    Conformément aux dispositions légales en vigueur, les présentes mentions légales
                    définissent les conditions d’utilisation du site <strong>Journal Alhiwar</strong>.
                </Text>

                <Divider />

                <Heading size="md">Éditeur du site</Heading>
                <Text>
                    Nom du site : <strong>Journal Alhiwar</strong>
                    <br />
                    Responsable de la publication : Annour
                    <br />
                    Email : contact@alhiwar.com
                </Text>

                <Divider />

                <Heading size="md">Hébergement</Heading>
                <Text>
                    Le site est hébergé par un prestataire tiers.
                    <br />
                    Les informations techniques sont gérées par l’hébergeur.
                </Text>

                <Divider />

                <Heading size="md">Propriété intellectuelle</Heading>
                <Text>
                    L’ensemble des contenus (articles, textes, images, logos, vidéos, code source)
                    présents sur ce site sont protégés par le droit d’auteur.
                    <br />
                    Toute reproduction ou diffusion sans autorisation est interdite.
                </Text>

                <Divider />

                <Heading size="md">Responsabilité</Heading>
                <Text>
                    L’éditeur s’efforce de fournir des informations exactes et mises à jour,
                    mais ne saurait être tenu responsable des erreurs ou omissions.
                </Text>
            </VStack>
        </Box>
    );
}
