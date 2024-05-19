import { FC, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Box } from "../../components/ui/display/box/box";
import { Sider } from "../../components/layout/sider/sider.web";
import { Header } from "../../components/layout/header";

export function withLayout<C extends (args: any) => ReactNode>(
  Component: C,
): FC {
  return (a: Parameters<C>["0"]) => (
    <>
      <Header />
      <Box row grow style={styles.root}>
        <View style={styles.sider}>
          <Sider />
        </View>
        <View style={styles.content}>
          <Box grow basis={0} shrink>
            <Component {...a} />
          </Box>
        </View>
      </Box>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
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
