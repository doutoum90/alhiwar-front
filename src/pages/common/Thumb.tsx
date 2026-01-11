import { FaFilePdf } from "react-icons/fa";
import type { ArticleMediaDto } from "../../types";
import { abs } from "../../utils/url";
import { Box, Image, } from "@chakra-ui/react";

export function Thumb({ item }: { item: ArticleMediaDto }) {
    if (item.type === "image") {
        return (
            <Image
                src={abs(item.url)}
                alt={item.title ?? "image"}
                borderRadius="lg"
                w="88px"
                h="64px"
                objectFit="cover"
            />
        );
    }

    if (item.type === "video") {
        return (
            <Box
                w="88px"
                h="64px"
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="gray.50"
            >
                <Box as="iframe" src={abs(item.url)} title={item.title ?? "video"} w="88px" h="64px" />
            </Box>
        );
    }

    return (
        <Box
            w="88px"
            h="64px"
            borderWidth="1px"
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="gray.50"
        >
            <FaFilePdf />
        </Box>
    );
}
