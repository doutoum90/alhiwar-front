import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  Alert,
  AlertIcon,
  Container,
  Card,
  CardBody,
  Flex,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { type RegisterData } from '../types';

export const Register = () => {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      navigate('/espace-membre/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" py={8}>
      <Container maxW="lg">
        <Card>
          <CardBody p={8}>
            <VStack spacing={6}>
              <Box textAlign="center">
                <Heading size="lg" color="teal.600" mb={2}>
                  Rejoindre Alhiwar
                </Heading>
                <Text color="gray.600">
                  Créez votre compte pour accéder à tous nos services
                </Text>
              </Box>

              {error && (
                <Alert status="error" rounded="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <Box as="form" onSubmit={handleSubmit} w="100%">
                <VStack spacing={4}>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} w="100%">
                    <GridItem>
                      <FormControl>
                        <FormLabel>Prénom</FormLabel>
                        <Input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="John"
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel>Nom</FormLabel>
                        <Input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Doe"
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <FormControl isRequired>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <Input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="johndoe"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Mot de passe</FormLabel>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="teal"
                    size="lg"
                    w="100%"
                    isLoading={isLoading}
                    loadingText="Création du compte..."
                  >
                    Créer mon compte
                  </Button>
                </VStack>
              </Box>

              <Box textAlign="center">
                <Text color="gray.600">
                  Déjà un compte ?{' '}
                  <Link as={RouterLink} to="/auth/login" color="teal.600" fontWeight="semibold">
                    Se connecter
                  </Link>
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Flex>
  );
};


export default Register;