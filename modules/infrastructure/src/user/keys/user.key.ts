export const userKeys = {
  all: ["user"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  roles: () => [...userKeys.all, "roles"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
};
