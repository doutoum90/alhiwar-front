import { Link as ChakraLink, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import type { NavLinkProps } from "../../types";

export const NavLink = ({
    to,
    children,
    isActive,
    onClick,
}: NavLinkProps) => (
    <ChakraLink
        as={RouterLink}
        to={to}
        onClick={onClick}
        px={3}
        py={2}
        rounded="md"
        fontWeight="medium"
        bg={isActive ? useColorModeValue("blue.100", "blue.700") : "transparent"}
        color={isActive ? useColorModeValue("blue.700", "white") : "inherit"}
        _hover={{ textDecoration: "none", bg: useColorModeValue("blue.50", "blue.600") }}
    >
        {children}
    </ChakraLink>
);