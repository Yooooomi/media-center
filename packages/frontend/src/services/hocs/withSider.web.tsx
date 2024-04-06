import { FC, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Box } from "../../components/ui/display/box/box";
import { Sider } from "../../components/sider/sider";

export function withSider<C extends (args: any) => ReactNode>(
  Component: C,
): FC {
  return (a: Parameters<C>["0"]) => (
    <Box row grow style={styles.root}>
      <View style={styles.content}>
        <Box grow basis={0} shrink>
          <Component {...a} />
        </Box>
      </View>
      <View style={styles.sider}>
        <Sider />
      </View>
    </Box>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row-reverse",
    flexBasis: 0,
  },
  content: {
    flexBasis: 0,
    flexGrow: 1,
    zIndex: 1,
  },
  sider: {
    width: 250,
  },
});
