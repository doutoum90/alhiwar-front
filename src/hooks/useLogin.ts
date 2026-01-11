import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { resolvePrivateFallback } from "../routes/resolveFallback";

export function useLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const rawFrom = (location.state as any)?.from?.pathname || "/espace-membre/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsFetching(true);

    try {
      const me = await login({ email, password });

      const target = rawFrom?.startsWith("/espace-membre")
        ? rawFrom
        : resolvePrivateFallback(me);

      navigate(target, { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Connexion impossible");
    } finally {
      setIsFetching(false);
    }
  };

  return { email, setEmail, password, setPassword, error, isFetching, handleSubmit };
}
