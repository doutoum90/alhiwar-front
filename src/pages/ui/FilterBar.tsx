import { Card, CardBody, Flex, Box } from "@chakra-ui/react";
import type { FilterBarProps } from "../../types";

export default function FilterBar({ left, right, mb = 6 }: FilterBarProps) {
    return (
        <Card mb={mb}>
            <CardBody>
                <Flex gap={4} wrap="wrap" justify="space-between" align={{ base: "stretch", md: "center" }}>
                    {}
                    <Box flex="1" minW={{ base: "full", md: "420px" }}>
                        {left}
                    </Box>

                    {}
                    {right ? (
                        <Box w={{ base: "full", md: "auto" }}>
                            <Flex
                                gap={3}
                                wrap="wrap"
                                w="full"
                                justify={{ base: "stretch", md: "flex-end" }}
                                align="center"
                            >
                                {right}
                            </Flex>
                        </Box>
                    ) : null}
                </Flex>
            </CardBody>
        </Card>
    );
}
