import { useHeaderHeight } from "../../../../services/hooks/useHeaderHeight";
import { Box, BoxProps } from "../box/box";

export function BoxPadded(props: BoxProps) {
  const headerHeight = useHeaderHeight();
  return <Box style={{ marginTop: headerHeight }} {...props} />;
}
