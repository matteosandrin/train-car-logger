export const assetUrl = (relativePath: string) => {
  return relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
};
