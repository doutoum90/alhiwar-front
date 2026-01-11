import { Box, Table, useColorModeValue } from "@chakra-ui/react";
import type { AppTableProps } from "../../types";

export default function AppTable({
  children,
  size = "sm",
  variant = "simple",
  stickyHeader = true,
}: AppTableProps) {
  const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const headBg = useColorModeValue("gray.50", "gray.800");
  const rowHover = useColorModeValue("blackAlpha.50", "whiteAlpha.100");
  const zebraBg = useColorModeValue("blackAlpha.50", "whiteAlpha.50");

  return (
    <Box overflowX="auto">
      <Box borderWidth="1px" borderColor={border} borderRadius="xl" overflow="hidden">
        <Table
          size={size}
          variant={variant}
          sx={{
            "thead th": {
              bg: headBg,
              ...(stickyHeader
                ? {
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }
                : {}),
              textTransform: "none",
              fontWeight: 700,
              fontSize: "sm",
              letterSpacing: "0.2px",
              borderColor: border,
            },
            "tbody td": {
              borderColor: border,
            },
            "tbody tr:nth-of-type(even) td": {
              bg: zebraBg,
            },
            "tbody tr:hover td": {
              bg: rowHover,
            },
          }}
        >
          {children}
        </Table>
      </Box>
    </Box>
  );
}
