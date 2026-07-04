import { useQuery } from "@tanstack/react-query";
import { useUserDI } from "./useUserDI";
import { userKeys } from "@infrastructure/user/keys/user.key";
import type { UserModel } from "@core/user/domains/models/user.model";

export const useProfile = () => {
  const { getProfileUseCase } = useUserDI();

  return useQuery<UserModel>({
    queryKey: userKeys.profile(),
    queryFn: () => getProfileUseCase.execute(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
