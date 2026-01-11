import { Flex, Td, Tr } from "@chakra-ui/react";
import type { ReactNode } from "react";

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
    return (
        <Tr>
            <Td colSpan={colSpan}>
                <Flex py={10} justify="center" color="gray.500">
                    {children}
                </Flex>
            </Td>
        </Tr>
    );
}
