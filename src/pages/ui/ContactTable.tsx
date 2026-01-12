
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
import { FaArchive, FaCheck, FaEllipsisV, FaTimes, FaTrash } from "react-icons/fa";
import type { ContactTableProps } from "../../types";
import { excerpt, toDateLabel } from "../../utils/utils";

export default function ContactTable({
  mode,
  rows,
  busyId,
  onRowClick,
  onMarkRead,
  onMarkUnread,
  onArchive,
  onDelete,
}: ContactTableProps) {
  const stop = (e: MouseEvent) => e.stopPropagation();
  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Contact</Th>
          <Th>Sujet</Th>
          <Th>Message</Th>
          <Th>État</Th>
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
              opacity={r.archivedAt ? 0.6 : 1}
              onClick={() => onRowClick?.(r)}
              cursor={onRowClick ? "pointer" : "default"}
              _hover={onRowClick ? { bg: "blackAlpha.50" } : undefined}
            >
              <Td>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="semibold">{r.name || "—"}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {r.email || "—"}
                  </Text>
                </VStack>
              </Td>

              <Td maxW="280px">
                <Text noOfLines={1}>{r.subject || "—"}</Text>
              </Td>

              <Td maxW="520px">
                <Text noOfLines={2} color="gray.700">
                  {excerpt(r.message, 150)}
                </Text>
              </Td>

              <Td>
                {r.archivedAt ? (
                  <Badge colorScheme="purple">Archivé</Badge>
                ) : r.isRead ? (
                  <Badge colorScheme="green">Lu</Badge>
                ) : (
                  <Badge colorScheme="red">Non lu</Badge>
                )}
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
                        icon={<FaCheck />}
                        onClick={(e) => {
                          stop(e);
                          onMarkRead?.(r);
                        }}
                        isDisabled={!onMarkRead || r.isRead || Boolean(r.archivedAt)}
                      >
                        Marquer comme lu
                      </MenuItem>

                      {onMarkUnread ? (
                        <MenuItem
                          icon={<FaTimes />}
                          onClick={(e) => {
                            stop(e);
                            onMarkUnread?.(r);
                          }}
                          isDisabled={!onMarkUnread || !r.isRead || Boolean(r.archivedAt)}
                        >
                          Marquer comme non lu
                        </MenuItem>
                      ) : null}

                      {onArchive ? (
                        <MenuItem
                          icon={<FaArchive />}
                          onClick={(e) => {
                            stop(e);
                            onArchive?.(r);
                          }}
                          isDisabled={!onArchive || Boolean(r.archivedAt)}
                        >
                          Archiver
                        </MenuItem>
                      ) : null}

                      {onDelete ? (
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
                      ) : null}
                    </MenuList>
                  </Menu>
                </Flex>

                {mode === "unread" ? (
                  <HStack justify="flex-end" mt={2} spacing={2}>
                    <IconButton
                      aria-label="Marquer lu"
                      size="xs"
                      variant="outline"
                      colorScheme="green"
                      icon={<FaCheck />}
                      onClick={(e) => {
                        stop(e);
                        onMarkRead?.(r);
                      }}
                      isDisabled={!onMarkRead || r.isRead || isBusy}
                      isLoading={isBusy}
                    />
                    <IconButton
                      aria-label="Supprimer"
                      size="xs"
                      variant="outline"
                      colorScheme="red"
                      icon={<FaTrash />}
                      onClick={(e) => {
                        stop(e);
                        onDelete?.(r);
                      }}
                      isDisabled={!onDelete || isBusy}
                    />
                  </HStack>
                ) : null}
              </Td>
            </Tr>
          );
        })}

        {rows.length === 0 ? (
          <Tr>
            <Td colSpan={6}>
              <Flex py={10} justify="center" color="gray.500">
                Aucun message
              </Flex>
            </Td>
          </Tr>
        ) : null}
      </Tbody>
    </Table>
  );
}
