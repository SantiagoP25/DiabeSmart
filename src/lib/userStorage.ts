export const buildUserStorageKey = (baseKey: string, userId: string | null | undefined) => {
  return `${baseKey}:${userId ?? "anonymous"}`;
};
