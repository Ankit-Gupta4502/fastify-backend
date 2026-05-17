import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../lib/react-query/query-keys";
import { loginUser, registerUser } from "./auth.api";
import { useAuthStore } from "./auth.store";

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const setAuthUser = useAuthStore((state) => state.setAuthUser);

  return useMutation({
    mutationFn: registerUser,
    onSuccess: async (response) => {
      if (response.data?.user) {
        setAuthUser({
          authUser: response.data.user.name,
          authRole: response.data.user.role,
        });
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.session(),
      });
    },
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const setAuthUser = useAuthStore((state) => state.setAuthUser);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (response) => {
      if (response.data?.user) {
        setAuthUser({
          authUser: response.data.user.name,
          authRole: response.data.user.role,
        });
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.session(),
      });
    },
  });
}
