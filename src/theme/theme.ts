import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { COLORS } from './colors';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Ajout des poids de police manquants
const fontWeights = {
  hairline: 100,
  thin: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

const theme = extendTheme({
  config,
  // Ajout des fontWeights manquants
  fontWeights,
  shadows: {
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  styles: {
    global: ({ colorMode }: { colorMode: string }) => ({
      'html, #root': {
        fontSize: 'md',
        height: '100%',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      },
      body: {
        bg: colorMode === 'dark' ? COLORS.DARK.BACKGROUND : COLORS.LIGHT.BACKGROUND,
        color: colorMode === 'dark' ? COLORS.DARK.TEXT : COLORS.LIGHT.TEXT,
        overflowX: 'hidden',
        fontFamily: 'N27, sans-serif',
        fontSize: 'md',
        height: '100%',
        backgroundImage: colorMode === 'light'
          ? `radial-gradient(208.77% 95.91% at -3.54% 105.56%, rgba(61, 132, 168, 0.25) 0%, rgba(217, 217, 217, 0.00) 100%)`
          : undefined,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      },
    }),
  },
  fonts: {
    heading: `'N27', sans-serif`,
    body: `'N27', sans-serif`,
  },
  // Configuration des tailles de police corrigée
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  colors: {
    app: {
      pageBg: {
        light: COLORS.LIGHT.BACKGROUND,
        dark: COLORS.DARK.BACKGROUND,
      },
      cardBg: {
        light: COLORS.LIGHT.BACKGROUND,
        dark: COLORS.DARK.BACKGROUND,
      },
      textPrimary: {
        light: COLORS.LIGHT.TEXT,
        dark: COLORS.DARK.TEXT,
      },
      textSecondary: {
        light: COLORS.LIGHT.TEXT_SECONDARY,
        dark: COLORS.DARK.TEXT_SECONDARY,
      },
      button: COLORS.PRIMARY,
      progress: COLORS.PRIMARY,
      badge: COLORS.PRIMARY,
      formBg: {
        light: COLORS.LIGHT.BACKGROUND,
        dark: COLORS.DARK.BACKGROUND
      },
      heading: COLORS.PRIMARY_DARK,
      text: COLORS.PRIMARY_LIGHT,
      link: COLORS.PRIMARY,
      focusBorder: COLORS.PRIMARY,
      spinner: COLORS.PRIMARY,
    },
    black: COLORS.BLACK,
    white: COLORS.WHITE,
    gray_disabled: COLORS.GRAY_DISABLED,
    blue: {
      600: COLORS.PRIMARY_DARK,
    },
    brand: {
      50: COLORS.GRAY_LIGHT,
      100: COLORS.ACCENT,
      500: COLORS.PRIMARY,
      600: COLORS.PRIMARY_DARK,
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold', // Utilise maintenant la configuration fontWeights
        borderRadius: 'md',
      },
      variants: {
        primary: () => ({
          bg: COLORS.PRIMARY,
          color: COLORS.WHITE,
          _hover: { bg: COLORS.PRIMARY_DARK },
          _disabled: {
            bg: COLORS.GRAY_DISABLED,
            opacity: 0.6,
            cursor: 'not-allowed',
          },
        }),
        ghost: ({ colorMode }: { colorMode: string }) => ({
          color: colorMode === 'dark' ? COLORS.WHITE : COLORS.PRIMARY_DARK,
          _hover: {
            bg: colorMode === 'dark'
              ? COLORS.PRIMARY_DARK
              : COLORS.GRAY_LIGHT,
          },
        }),
      },
    },
    Card: {
      baseStyle: ({ colorMode }: { colorMode: string }) => ({
        bg: colorMode === 'dark' ? COLORS.DARK.BACKGROUND : COLORS.LIGHT.BACKGROUND,
        borderRadius: 'xl',
        boxShadow: 'md',
        transition: 'background-color 0.3s ease',
      }),
    },

    Heading: {
      baseStyle: ({ colorMode }: { colorMode: string }) => ({
        color: colorMode === 'dark' ? COLORS.WHITE : COLORS.PRIMARY_DARK,
        fontWeight: 'bold', // Utilise la configuration fontWeights
      }),
    },
    Input: {
      baseStyle: ({ colorMode }: { colorMode: string }) => ({
        field: {
          bg: colorMode === 'dark' ? COLORS.DARK.BACKGROUND : COLORS.LIGHT.BACKGROUND,
          borderColor: colorMode === 'dark'
            ? COLORS.DARK.BORDER
            : COLORS.LIGHT.BORDER,
          color: colorMode === 'dark' ? COLORS.DARK.TEXT : COLORS.LIGHT.TEXT,
          _focus: {
            borderColor: COLORS.PRIMARY,
            boxShadow: `0 0 0 1px ${COLORS.PRIMARY}`,
          },
        },
      }),
    },
  },
});

export default theme;