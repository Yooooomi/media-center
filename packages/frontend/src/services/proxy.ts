import { Beta } from "./api";

export function proxifyUrl(url: string) {
  return Beta.getUrl(`/proxy/${encodeURIComponent(url)}`);
}
