import { Spinner } from '@chakra-ui/react';

export const LoadingSpinner = () => (
    <div className="flex justify-center p-8">
        <Spinner size="xl" thickness="3px" speed="0.65s" />
    </div>
);