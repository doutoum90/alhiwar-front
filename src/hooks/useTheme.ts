import { useColorMode, useColorModeValue } from '@chakra-ui/react';

export const useTheme = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  const colors = {
    background: useColorModeValue('white', 'gray.800'),
    text: useColorModeValue('gray.800', 'white'),
    subtle: useColorModeValue('gray.600', 'gray.400'),
    border: useColorModeValue('gray.200', 'gray.600'),
    hover: useColorModeValue('gray.100', 'gray.700'),
    icon: useColorModeValue('gray.600', 'gray.300'),
    cardBg: useColorModeValue('white', 'gray.700'),
    cardShadow: useColorModeValue('sm', 'dark-lg')
  };

  return {
    colorMode,
    toggleColorMode,
    colors
  };
};