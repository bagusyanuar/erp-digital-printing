import { useDI } from "../../shared/di/DIContext";
import type { UserUseCases } from "../../shared/di/DIContext";

export const useUserDI = (): UserUseCases => useDI().user;
