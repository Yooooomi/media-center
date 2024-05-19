import { FC, ReactNode } from "react";
import { StyleSheet, TVFocusGuideView } from "react-native";
import { Box } from "../../components/ui/display/box/box";
import { Sider } from "../../components/layout/sider/sider";

export function withLayout<C extends (args: any) => ReactNode>(
  Component: C,
): FC {
  return (a: Parameters<C>["0"]) => (
    <Box row grow style={styles.root}>
      <TVFocusGuideView
        style={styles.content}
        trapFocusDown
        trapFocusUp
        autoFocus
      >
        <Box grow>
          <Component {...a} />
        </Box>
      </TVFocusGuideView>
      <TVFocusGuideView trapFocusDown trapFocusUp autoFocus={false}>
        <Sider />
      </TVFocusGuideView>
    </Box>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row-reverse",
  },
  content: {
    flexBasis: 0,
    flexGrow: 1,
    zIndex: 1,
  },
});
