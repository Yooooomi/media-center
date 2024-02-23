import { Beta } from "./api/api";

export function proxifyUrl(url: string) {
  return Beta.getUrl(`/proxy/${encodeURIComponent(url)}`);
}
