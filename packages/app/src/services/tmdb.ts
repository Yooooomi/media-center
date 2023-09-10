export function useImageUri(path: string | undefined, large?: boolean) {
  return `https://image.tmdb.org/t/p/${large ? 'original' : 'w500'}${path}`;
}
