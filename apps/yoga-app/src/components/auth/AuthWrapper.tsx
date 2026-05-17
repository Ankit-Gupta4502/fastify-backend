import { useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { authQueryOptions, useAuth } from "../../hooks/use-auth";

export function AuthWrapper({ children }: { children: ReactNode }) {
  const { setUser, setLoading } = useAuth();
  const { data, isLoading, isError } = useQuery(authQueryOptions.userDetail());

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }

    if (data?.success && data.data) {
      setUser(data.data);
    } else if (isError || (data && !data.success)) {
      setUser(null);
    }
  }, [data, isLoading, isError, setUser, setLoading]);

  return <>{children}</>;
}
