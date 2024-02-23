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
        <Box grow>
          <Component {...a} />
        </Box>
      </View>
      <View>
        <Sider />
      </View>
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
