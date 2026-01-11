import { HStack, Box, Avatar, Badge, IconButton, Text } from "@chakra-ui/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaGripVertical, FaCrown, FaTrash } from "react-icons/fa";
import type { SelectedAuthorRowProps } from "../../types";

export function SelectedAuthorRow({
    u,
    idx,
    onMakeMain,
    onRemove,
}: SelectedAuthorRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: u.id });
    return (
        <HStack
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.7 : 1,
            }}
            borderWidth="1px"
            borderRadius="2xl"
            p={3}
            bg={idx === 0 ? "yellow.50" : "white"}
            align="center"
            gap={3}
        >
            {/* Drag handle */}
            <Box
                {...attributes}
                {...listeners}
                cursor="grab"
                color="gray.500"
                _active={{ cursor: "grabbing" }}
                userSelect="none"
                px={1}
            >
                <FaGripVertical />
            </Box>

            <Avatar size="sm" name={u.name ?? (u as any).username} src={u.avatar ?? undefined} />

            <Box flex="1" minW={0}>
                <HStack spacing={2}>
                    <Text fontWeight="semibold" noOfLines={1}>
                        {u.name ?? (u as any).username ?? "Utilisateur"}
                    </Text>
                    {idx === 0 ? (
                        <Badge colorScheme="yellow" variant="solid">
                            Main
                        </Badge>
                    ) : null}
                </HStack>
                <Text fontSize="sm" color="gray.500" noOfLines={1}>
                    {u.email || "—"}
                </Text>
            </Box>

            <HStack>
                <IconButton
                    aria-label="Make main"
                    icon={<FaCrown />}
                    size="sm"
                    variant="outline"
                    colorScheme="yellow"
                    onClick={() => onMakeMain(u.id)}
                    isDisabled={idx === 0}
                />
                <IconButton
                    aria-label="Remove"
                    icon={<FaTrash />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => onRemove(u.id)}
                />
            </HStack>
        </HStack>
    );
}