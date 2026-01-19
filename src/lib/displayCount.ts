export const displayCount = (n?: number) => {
  if (!n || n <= 0) return 0;
  return n > 9 ? "9+" : n;
};
