import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    VStack,
    HStack,
    Link,
} from "@chakra-ui/react";
import type { CacheConsentProps } from "../../types";
import { setCacheConsent } from "../../utils/utils";

export default function CacheConsentModal({ isOpen, onClose, onAccepted, onRejected }: CacheConsentProps) {
    const acceptAll = () => {
        setCacheConsent("accepted");
        onAccepted?.();
        onClose();
    };

    const reject = () => {
        setCacheConsent("rejected");
        onRejected?.();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg" closeOnOverlayClick={false}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Préférences cookies & cache</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack align="start" spacing={3}>
                        <Text>
                            Nous utilisons des cookies et des mécanismes de cache pour assurer le fonctionnement du site,
                            améliorer l’expérience et mesurer l’audience.
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                            Les cookies essentiels sont nécessaires au fonctionnement. Les cookies non essentiels (mesure d’audience)
                            nécessitent votre consentement.
                        </Text>

                        <HStack spacing={2} fontSize="sm">
                            <Text>En savoir plus :</Text>
                            <Link href="/confidentialite" color="teal.500">
                                Politique de confidentialité
                            </Link>
                        </HStack>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <HStack w="full" justify="space-between" wrap="wrap" gap={2}>
                        <Button variant="outline" onClick={reject}>
                            Refuser
                        </Button>
                        <HStack>
                            <Button colorScheme="teal" onClick={acceptAll}>
                                Accepter
                            </Button>
                        </HStack>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
