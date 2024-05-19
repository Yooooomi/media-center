import { Spacing } from "@media-center/ui/src/constants";
import { Platform } from "react-native";
import { isTV } from "../platform";

export const PAGE_PADDING = Platform.select<Spacing>({
  web: "S16",
  native: isTV() ? "S16" : "S8",
  default: "S48",
});
