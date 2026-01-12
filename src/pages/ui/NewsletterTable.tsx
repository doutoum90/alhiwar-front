
import type { MouseEvent } from "react";
import {
  Badge,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { FaCheck, FaEllipsisV, FaTimes, FaTrash } from "react-icons/fa";
import type { NewsletterProps } from "../../types";
import { toDateLabel } from "../../utils/utils";

export default function NewsletterTable({
  mode,
  rows,
  busyId,
  onRowClick,
  onDelete,
  onToggleActive,
  onToggleVerified,
}: NewsletterProps) {
  const stop = (e: MouseEvent) => e.stopPropagation();
  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Email</Th>
          <Th>Actif</Th>
          <Th>Vérifié</Th>
          <Th>Date</Th>
          <Th textAlign="right">Actions</Th>
        </Tr>
      </Thead>

      <Tbody>
        {rows.map((r) => {
          const isBusy = busyId === r.id;

          return (
            <Tr
              key={r.id}
              onClick={() => onRowClick?.(r)}
              cursor={onRowClick ? "pointer" : "default"}
              _hover={onRowClick ? { bg: "blackAlpha.50" } : undefined}
            >
              <Td>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="semibold">{r.email}</Text>
                  <Badge mt={1} colorScheme={r.isVerified ? "green" : "red"}>
                    {r.isVerified ? "Vérifié" : "Non vérifié"}
                  </Badge>
                </VStack>
              </Td>

              <Td>
                <Badge colorScheme={r.isActive ? "green" : "gray"}>
                  {r.isActive ? "Actif" : "Inactif"}
                </Badge>
              </Td>

              <Td>
                <Badge colorScheme={r.isVerified ? "green" : "red"}>
                  {r.isVerified ? "Verifie" : "Non verifie"}
                </Badge>
              </Td>

              <Td>
                <Text fontSize="sm" color="gray.600">
                  {toDateLabel(r.createdAt ?? null)}
                </Text>
              </Td>

              <Td textAlign="right">
                <Flex justify="flex-end">
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FaEllipsisV />}
                      variant="ghost"
                      size="sm"
                      aria-label="Actions"
                      isDisabled={isBusy}
                      onClick={stop}
                    />
                    <MenuList>
                      <MenuItem
                        icon={r.isActive ? <FaTimes /> : <FaCheck />}
                        onClick={(e) => {
                          stop(e);
                          onToggleActive?.(r, !r.isActive);
                        }}
                        isDisabled={!onToggleActive}
                      >
                        {r.isActive ? "Desactiver" : "Activer"}
                      </MenuItem>

                      <MenuItem
                        icon={r.isVerified ? <FaTimes /> : <FaCheck />}
                        onClick={(e) => {
                          stop(e);
                          onToggleVerified?.(r, !r.isVerified);
                        }}
                        isDisabled={!onToggleVerified}
                      >
                        {r.isVerified ? "Deverifier" : "Verifier"}
                      </MenuItem>

                      <HStack px={3} py={1}>
                        <Badge colorScheme={r.isActive ? "green" : "gray"}>
                          {r.isActive ? "Actif" : "Inactif"}
                        </Badge>
                        <Badge colorScheme={r.isVerified ? "green" : "red"}>
                          {r.isVerified ? "Verifie" : "Non verifie"}
                        </Badge>
                      </HStack>

                      <MenuItem
                        icon={<FaTrash />}
                        onClick={(e) => {
                          stop(e);
                          onDelete?.(r);
                        }}
                        color="red.500"
                        isDisabled={!onDelete}
                      >
                        Supprimer
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>

                {mode === "unverified" ? (
                  <Text mt={2} fontSize="xs" color="red.500" textAlign="right">
                    Non vérifié
                  </Text>
                ) : null}
              </Td>
            </Tr>
          );
        })}

        {rows.length === 0 ? (
          <Tr>
            <Td colSpan={5}>
              <Flex py={10} justify="center" color="gray.500">
                Aucun abonné
              </Flex>
            </Td>
          </Tr>
        ) : null}
      </Tbody>
    </Table>
  );
}
