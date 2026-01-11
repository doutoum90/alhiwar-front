import { createContext, useContext, useEffect, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { AuthContextType, AuthProviderProps, MeDto, RegisterData } from "../types";
import * as authService from "../services/authService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  onLoginSuccess: onExternalLoginSuccess,
  onLogout: onExternalLogout,
}: AuthProviderProps) => {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<MeDto | null, Error>({
    queryKey: ["user"],
    queryFn: authService.fetchUser,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    queryClient.setQueryData(["user"], null);
    onExternalLogout?.();
  }, [queryClient, onExternalLogout]);

  const refreshTokenMutation = useMutation({
    mutationFn: () => authService.refreshToken(),
    onSuccess: (data: { access_token: string }) => {
      localStorage.setItem("access_token", data.access_token);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: () => {
      logout();
    },
  });

  const login = useCallback(
    async (credentials: { email: string; password: string }): Promise<MeDto> => {
      await queryClient.cancelQueries({ queryKey: ["user"] });

      const data = await authService.login(credentials);

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      const me = await authService.fetchUser();
      if (!me) throw new Error("Connexion OK mais /api/auth/me a échoué");

      queryClient.setQueryData(["user"], me);

      await queryClient.invalidateQueries({ queryKey: ["user"] });

      onExternalLoginSuccess?.();
      return me;
    },
    [queryClient, onExternalLoginSuccess]
  );


  const register = useCallback(
    async (userData: RegisterData) => {
      await authService.register(userData);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    [queryClient]
  );

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email);
  }, []);

  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["user"] });
  }, [queryClient]);

  useEffect(() => {
    const originalFetch = window.fetch;
    let isRefreshing = false;
    let refreshPromise: Promise<{ access_token: string }> | null = null;
    const retriedOnce = new Set<string>();

    window.fetch = async (url, config: RequestInit = {}) => {
      const u = url.toString();
      const newConfig: RequestInit = { ...config };
      const headers = new Headers(newConfig.headers || {});

      const token = localStorage.getItem("access_token");
      const isAuthFree =
        u.includes("/auth/login") ||
        u.includes("/auth/register") ||
        u.includes("/auth/refresh") ||
        u.includes("/api/auth/login") ||
        u.includes("/api/auth/register") ||
        u.includes("/api/auth/refresh");

      if (token && !isAuthFree && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      newConfig.headers = headers;

      const resp = await originalFetch(url, newConfig);

      if (resp.status !== 401 || u.includes("/auth/refresh") || u.includes("/api/auth/refresh")) {
        retriedOnce.delete(u);
        return resp;
      }

      if (retriedOnce.has(u)) {
        retriedOnce.delete(u);
        logout();
        throw new Error("Unauthorized after refresh");
      }

      retriedOnce.add(u);

      if (isRefreshing && refreshPromise) {
        const data = await refreshPromise;
        headers.set("Authorization", `Bearer ${data.access_token}`);
        newConfig.headers = headers;
        const second = await originalFetch(url, newConfig);
        retriedOnce.delete(u);
        return second;
      }

      isRefreshing = true;
      try {
        refreshPromise = refreshTokenMutation.mutateAsync() as any;
        const data = await refreshPromise;
        headers.set("Authorization", `Bearer ${data?.access_token}`);
        newConfig.headers = headers;
        const second = await originalFetch(url, newConfig);
        retriedOnce.delete(u);
        return second;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [refreshTokenMutation, logout]);

  const value: AuthContextType = {
    user: user as any,
    isLoading,
    login: login as any,
    logout,
    register,
    resetPassword,
    refreshAccessToken: async () => {
      const data = (await refreshTokenMutation.mutateAsync()) as { access_token: string };
      return data.access_token;
    },
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
