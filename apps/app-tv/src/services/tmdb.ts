import {proxifyUrl} from './proxy';

export function useImageUri(path: string | undefined, large?: boolean) {
  return path
    ? proxifyUrl(
        `https://image.tmdb.org/t/p/${large ? 'original' : 'w500'}${path}`,
      )
    : undefined;
}
