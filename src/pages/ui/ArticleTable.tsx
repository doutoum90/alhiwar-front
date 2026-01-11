
import {
  Avatar,
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
  Tooltip,
  Tr,
  VStack,
} from "@chakra-ui/react";
import {
  FaCheckCircle,
  FaEdit,
  FaEllipsisV,
  FaEye,
  FaTimesCircle,
  FaTrash,
  FaUndo,
} from "react-icons/fa";

import type { ArticleDto, ArticleStatus } from "../../types";

import { formatDate } from "../../utils/date";
import {
  getDisplayAuthorsFromArticle,
  getStatusColor,
  getStatusText,
  makeCategoryMap,
  resolveCategoryLabel,
} from "../../utils/article";
import type { ArticleTableProps } from "../../types";

export default function ArticleTable({
  mode,
  rows,
  categories = [],
  busyId = null,

  onPreview,
  onEdit,

  onPublish,
  onUnpublish,
  onDelete,

  onApprove,
  onReject,

  showInlineApproveButton = true,
}: ArticleTableProps) {
  const categoryMap = makeCategoryMap(categories);

  const DisabledItem = ({
    label,
    reason,
    icon,
  }: {
    label: string;
    reason: string;
    icon: any;
  }) => (
    <Tooltip label={reason} placement="left" hasArrow>
      <MenuItem icon={icon} isDisabled>
        {label}
      </MenuItem>
    </Tooltip>
  );

  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Titre</Th>
          <Th>Catégorie</Th>
          <Th>Statut</Th>
          <Th>Auteurs</Th>
          <Th isNumeric>Vues</Th>
          <Th>Publié</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>

      <Tbody>
        {rows.map((a: ArticleDto) => {
          const authors = getDisplayAuthorsFromArticle(a as any);
          const main = authors[0];
          const others = authors.slice(1);

          const status = ((a.status as ArticleStatus) ||
            (mode === "reviewQueue" ? "in_review" : "draft")) as ArticleStatus;

          const isBusy = busyId === a.id;

          return (
            <Tr key={a.id}>
              <Td>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="semibold" noOfLines={1}>
                    {a.title}
                  </Text>
                  <Text fontSize="sm" color="gray.600" noOfLines={1}>
                    {a.excerpt || "—"}
                  </Text>
                </VStack>
              </Td>

              <Td>{resolveCategoryLabel(a as any, categoryMap)}</Td>

              <Td>
                <Badge colorScheme={getStatusColor(status)}>
                  {getStatusText(status)}
                </Badge>
              </Td>

              <Td>
                {authors.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">
                    —
                  </Text>
                ) : (
                  <VStack align="start" spacing={1}>
                    <HStack spacing={2} wrap="wrap">
                      <Avatar
                        size="xs"
                        name={main?.name}
                        src={main?.avatar ?? undefined}
                      />
                      <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
                        {main?.name}
                      </Text>
                      {others.length > 0 ? (
                        <Badge variant="subtle" colorScheme="teal">
                          +{others.length}
                        </Badge>
                      ) : null}
                    </HStack>

                    {others.length > 0 ? (
                      <Text fontSize="xs" color="gray.600" noOfLines={1}>
                        Co-auteurs : {others.map((x) => x.name).join(", ")}
                      </Text>
                    ) : null}
                  </VStack>
                )}
              </Td>

              <Td isNumeric>
                {Number((a as any).views ?? 0).toLocaleString("fr-FR")}
              </Td>

              <Td>{formatDate((a as any).publishedAt ?? null)}</Td>

              <Td>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FaEllipsisV />}
                    variant="ghost"
                    size="sm"
                    aria-label="Actions"
                    isLoading={isBusy}
                  />
                  <MenuList>
                    {onPreview ? (
                      <MenuItem icon={<FaEye />} onClick={() => onPreview(a)}>
                        Prévisualiser
                      </MenuItem>
                    ) : (
                      <DisabledItem
                        icon={<FaEye />}
                        label="Prévisualiser"
                        reason="Vous n’avez pas accès à cette action."
                      />
                    )}

                    {onEdit ? (
                      <MenuItem icon={<FaEdit />} onClick={() => onEdit(a)}>
                        Ouvrir l’éditeur
                      </MenuItem>
                    ) : (
                      <DisabledItem
                        icon={<FaEdit />}
                        label="Ouvrir l’éditeur"
                        reason="Permission insuffisante."
                      />
                    )}

                    {mode === "articles" ? (
                      <>
                        {status !== "published" ? (
                          onPublish ? (
                            <MenuItem
                              icon={<FaCheckCircle />}
                              onClick={() => onPublish(a)}
                            >
                              Publier
                            </MenuItem>
                          ) : (
                            <DisabledItem
                              icon={<FaCheckCircle />}
                              label="Publier"
                              reason="Permission insuffisante."
                            />
                          )
                        ) : null}

                        {status === "published" ? (
                          onUnpublish ? (
                            <MenuItem
                              icon={<FaUndo />}
                              onClick={() => onUnpublish(a)}
                            >
                              Dépublier
                            </MenuItem>
                          ) : (
                            <DisabledItem
                              icon={<FaUndo />}
                              label="Dépublier"
                              reason="Permission insuffisante."
                            />
                          )
                        ) : null}

                        {onDelete ? (
                          <MenuItem
                            icon={<FaTrash />}
                            onClick={() => onDelete(a)}
                            color="red.500"
                          >
                            Supprimer
                          </MenuItem>
                        ) : (
                          <DisabledItem
                            icon={<FaTrash />}
                            label="Supprimer"
                            reason="Permission insuffisante."
                          />
                        )}
                      </>
                    ) : (
                      <>
                        {onApprove ? (
                          <MenuItem
                            icon={<FaCheckCircle />}
                            onClick={() => onApprove(a)}
                          >
                            Approuver et publier
                          </MenuItem>
                        ) : (
                          <DisabledItem
                            icon={<FaCheckCircle />}
                            label="Approuver et publier"
                            reason="Permission insuffisante."
                          />
                        )}

                        {onReject ? (
                          <MenuItem
                            icon={<FaTimesCircle />}
                            onClick={() => onReject(a)}
                            color="red.500"
                          >
                            Rejeter
                          </MenuItem>
                        ) : (
                          <DisabledItem
                            icon={<FaTimesCircle />}
                            label="Rejeter"
                            reason="Permission insuffisante."
                          />
                        )}
                      </>
                    )}
                  </MenuList>
                </Menu>

                {mode === "reviewQueue" &&
                  showInlineApproveButton &&
                  onApprove ? (
                  <Tooltip label="Approuver et publier" hasArrow>
                    <IconButton
                      ml={2}
                      aria-label="Approuver"
                      icon={<FaCheckCircle />}
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                      onClick={() => onApprove(a)}
                      isLoading={isBusy}
                    />
                  </Tooltip>
                ) : null}
              </Td>
            </Tr>
          );
        })}

        {rows.length === 0 && (
          <Tr>
            <Td colSpan={7}>
              <Flex py={10} justify="center" color="gray.500">
                {mode === "reviewQueue"
                  ? "Aucun article en review"
                  : "Aucun article"}
              </Flex>
            </Td>
          </Tr>
        )}
      </Tbody>
    </Table>
  );
}
