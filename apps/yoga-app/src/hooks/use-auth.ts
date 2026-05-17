import { useMutation, useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { authApi, userApi } from "../api";
import { useAuthStore } from "../store/auth.store";

// Query Options for prefetching/loaders
export const authQueryOptions = {
  session: () => queryOptions({
    queryKey: ["auth", "session"],
    queryFn: authApi.fetchSession,
    staleTime: 60_000,
  }),
  userDetail: () => queryOptions({
    queryKey: ["auth", "user-detail"],
    queryFn: userApi.fetchDetail,
    staleTime: 5 * 60_000,
  }),
};

// Custom Hooks
export function useAuth() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout: clearStore } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (response) => {
      if (response.data?.user) setUser(response.data.user);
      await queryClient.invalidateQueries({ queryKey: ["auth", "user-detail"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: async (response) => {
      if (response.data?.user) setUser(response.data.user);
      await queryClient.invalidateQueries({ queryKey: ["auth", "user-detail"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      clearStore();
      await queryClient.invalidateQueries({ queryKey: ["auth", "user-detail"] });
      window.location.assign("/"); // Force a full clean redirect
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setLoading,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
    getGoogleUrl: authApi.getGoogleUrl,
  };
}
