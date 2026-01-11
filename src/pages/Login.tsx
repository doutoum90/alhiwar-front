import { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Heading,
    Input,
    InputGroup,
    InputRightElement,
    Link,
    Text,
    VStack,
    Alert,
    AlertIcon,
    Spinner,
    useColorModeValue,
} from '@chakra-ui/react';
import { useLogin } from '../hooks/useLogin';
import { AUTH_FORM_COLORS as COLORS } from '../constantes';

export const Login = () => {
    const { email, setEmail, password, setPassword, error, isFetching, handleSubmit } = useLogin();
    const [showPassword, setShowPassword] = useState(false);
    const formBg = useColorModeValue(COLORS.formBgLight, COLORS.formBgDark);

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minH="100vh"
            width="100vw"
            p={4}
        >
            <Box
                as="form"
                onSubmit={handleSubmit}
                bg={formBg}
                p={8}
                borderRadius="xl"
                boxShadow="2xl"
                width="100%"
                maxW="md"
                textAlign="center"
            >
                <VStack spacing={6}>
                    <Heading size="xl" color={COLORS.heading} fontWeight="extrabold" mb={6}>
                        Connectez-vous
                    </Heading>

                    {error && (
                        <Alert status="error" borderRadius="md" variant="subtle">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}

                    <FormControl id="email" isRequired>
                        <FormLabel fontSize="md">Email</FormLabel>
                        <Input
                            type="email"
                            size="lg"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre@email.com"
                            focusBorderColor={COLORS.focusBorder}
                            borderRadius="md"
                        />
                    </FormControl>

                    <FormControl id="password" isRequired>
                        <FormLabel fontSize="md">Mot de passe</FormLabel>
                        <InputGroup size="lg">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                focusBorderColor={COLORS.focusBorder}
                                borderRadius="md"
                            />
                            <InputRightElement width="4.5rem" mr={1}>
                                <Button
                                    h="1.75rem"
                                    size="sm"
                                    onClick={() => setShowPassword(!showPassword)}
                                    variant="ghost"
                                    colorScheme="teal"
                                >
                                    {showPassword ? 'Cacher' : 'Afficher'}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </FormControl>

                    {isFetching ? (
                        <Spinner size="xl" color={COLORS.spinner} />
                    ) : (
                        <Button
                            type="submit"
                            colorScheme="teal"
                            width="full"
                            size="lg"
                            mt={4}
                            borderRadius="md"
                            fontWeight="bold"
                            _hover={COLORS.buttonHover}
                            transition="all 0.2s"
                        >
                            Connexion
                        </Button>
                    )}

                    <Text textAlign="center" mt={4} color={COLORS.text}>
                        Mot de passe oublié ?{' '}
                        <Link href="/auth/password-reset" color={COLORS.link} fontWeight="semibold" textDecoration="underline">
                            Réinitialiser votre mot de passe
                        </Link>
                    </Text>
                </VStack>
            </Box>
        </Box>
    );
};

export default Login;