import { Box, Heading, Text, VStack, Divider } from "@chakra-ui/react";

export default function PolitiqueConfidentialite() {
    return (
        <Box maxW="4xl" mx="auto" px={4} py={10}>
            <VStack align="stretch" spacing={6}>
                <Heading size="lg">Politique de confidentialité</Heading>

                <Text>
                    La présente politique de confidentialité décrit la manière dont
                    <strong> Journal Alhiwar </strong>
                    collecte et traite les données personnelles des utilisateurs.
                </Text>

                <Divider />

                <Heading size="md">Données collectées</Heading>
                <Text>
                    Les données susceptibles d’être collectées sont :
                    <br />• Nom ou pseudonyme
                    <br />• Adresse email
                    <br />• Contenu des messages ou commentaires
                    <br />• Données techniques de navigation
                </Text>

                <Divider />

                <Heading size="md">Utilisation des données</Heading>
                <Text>
                    Les données sont utilisées exclusivement pour :
                    <br />• La gestion des comptes utilisateurs
                    <br />• La publication de contenus
                    <br />• L’amélioration du service
                    <br />• La communication avec les utilisateurs
                </Text>

                <Divider />

                <Heading size="md">Partage des données</Heading>
                <Text>
                    Aucune donnée personnelle n’est vendue ou cédée à des tiers.
                    Elles peuvent être hébergées chez des prestataires techniques sécurisés.
                </Text>

                <Divider />

                <Heading size="md">Droits des utilisateurs</Heading>
                <Text>
                    Conformément à la réglementation, chaque utilisateur dispose d’un droit
                    d’accès, de rectification et de suppression de ses données personnelles.
                    <br />
                    Pour exercer ce droit, contactez : contact@alhiwar.com
                </Text>
            </VStack>
        </Box>
    );
}
