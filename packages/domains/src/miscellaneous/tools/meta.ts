import { dirname, join } from "path";

export const Dirname = (url: string) => dirname(url).split("file://")[1]!;
export const GetAsset = (assetName: string) =>
  join(__dirname, "..", "..", "assets", assetName);
