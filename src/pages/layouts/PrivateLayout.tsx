import { Box, Flex, Container } from "@chakra-ui/react";
import type { PrivateLayoutProps } from "../../types";
import { PrivateFooter } from "../common/PrivateFooter";
import SideMenu from "../common/SideMenu";

export const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  return (
    <Flex bg="gray.50" minH="100dvh" w="full">
      <SideMenu />

      <Box flex="1" ml={{ base: 0, md: "250px" }}>
        <Container maxW="7xl" py={6}>
          {children}
        </Container>

        <PrivateFooter />
      </Box>
    </Flex>
  );
};
