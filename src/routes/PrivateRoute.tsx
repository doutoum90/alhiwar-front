// src/routes/ProtectedRoute.tsx
import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spinner, Center } from "@chakra-ui/react";
import { useAuth } from "../contexts/AuthContext";
import { canAccess } from "../utils/auth/access";
import { resolvePrivateFallback } from "./resolveFallback";

export function ProtectedRoute({
  children,
  roles,
  permissions,
}: {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
}) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  const ok = canAccess(user as any, { roles, permissions });

  if (!ok) {
    const fallback = resolvePrivateFallback(user as any);
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};
