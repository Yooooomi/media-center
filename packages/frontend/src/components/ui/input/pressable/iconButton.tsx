import { ActivityIndicator } from "react-native";
import { Icon } from "../../display/icon";
import { Box } from "../../display/box";
import { IconName } from "../../display/icon/icon.props";
import { Pressable } from "./pressable";

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  onLongPress?: () => void;
  focusOnMount?: boolean;
  disabled?: boolean;
  loading?: boolean;
  size?: number;
}

export function IconButton({
  icon,
  onPress,
  onLongPress,
  focusOnMount,
  disabled,
  loading,
  size,
}: IconButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      focusOnMount={focusOnMount}
    >
      {({ focused }) => (
        <Box
          r="default"
          p="S4"
          bg={
            disabled
              ? "buttonBackgroundDisabled"
              : focused
                ? "buttonBackgroundFocused"
                : "buttonBackground"
          }
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Icon
              name={icon}
              size={size}
              color={
                disabled
                  ? "buttonTextDisabled"
                  : focused
                    ? "buttonTextFocused"
                    : "buttonText"
              }
            />
          )}
        </Box>
      )}
    </Pressable>
  );
}
