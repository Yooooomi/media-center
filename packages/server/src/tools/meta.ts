import { dirname, join } from "path";

export const Dirname = (url: string) => dirname(url).split("file://")[1]!;
export const GetAsset = (assetName: string) =>
  join(Dirname(import.meta.url), "..", "..", "assets", assetName);
