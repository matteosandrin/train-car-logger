export const assetUrl = (relativePath: string) => {
  const normalizedPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};
