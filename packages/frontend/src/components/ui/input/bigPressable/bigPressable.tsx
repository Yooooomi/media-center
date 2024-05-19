import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ReactNode } from "react";
import { noop } from "@media-center/algorithm";
import { Color, getColor, radius } from "@media-center/ui/src/constants";
import { Box } from "../../display/box";
import { Icon } from "../../display/icon/icon";
import { BoxProps } from "../../display/box/box";
import { ScaleButton } from "../pressable/scaleButton";
import { Text } from "../text";
import { IconName } from "../../display/icon/icon.props";
import { Tooltip } from "../../display/tooltip";

interface BigPressableProps {
  disabled?: boolean;
  onPress: () => void;
  icon: IconName;
  text: string;
  loading?: boolean;
  loadingColor?: Color;
  bg?: BoxProps["bg"];
  children?: ReactNode;
  focusOnMount?: boolean;
  tooltip?: string;
}

export function BigPressable({
  disabled,
  onPress,
  bg,
  loading,
  icon,
  children,
  focusOnMount,
  text,
  tooltip,
  loadingColor,
}: BigPressableProps) {
  return (
    <Tooltip tooltip={tooltip}>
      <View style={styles.container}>
        <ScaleButton
          border="default"
          focusOnMount={focusOnMount}
          onPress={disabled ? noop : onPress}
        >
          <Box items="center" content="center" style={styles.aspect}>
            <Box bg={bg ?? ["whiteText", 0.3]} style={styles.background} />
            {children ? (
              children
            ) : !loading ? (
              <Icon name={icon} size={30} />
            ) : (
              <ActivityIndicator color={getColor(loadingColor)} size={20} />
            )}
          </Box>
        </ScaleButton>
        <Text size="small" style={styles.text}>
          {text}
        </Text>
      </View>
    </Tooltip>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.default,
    zIndex: 1,
    width: 70,
  },
  aspect: {
    flexGrow: 1,
    aspectRatio: 16 / 10,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.default,
    overflow: "hidden",
  },
  text: {
    marginTop: 2,
    textAlign: "center",
  },
});
