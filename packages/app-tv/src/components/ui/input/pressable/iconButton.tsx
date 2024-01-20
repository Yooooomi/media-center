import {ActivityIndicator} from 'react-native';
import {Icon} from '../../display/icon';
import {IconName} from '../../display/icon/icon';
import {Box} from '../../display/box';
import {Pressable} from './pressable';

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  focusOnMount?: boolean;
  disabled?: boolean;
  loading?: boolean;
  size?: number;
}

export function IconButton({
  icon,
  onPress,
  focusOnMount,
  disabled,
  loading,
  size,
}: IconButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      focusOnMount={focusOnMount}>
      {({focused}) => (
        <Box
          r="default"
          p="S4"
          bg={
            disabled
              ? 'buttonBackgroundDisabled'
              : focused
              ? 'buttonBackgroundFocused'
              : 'buttonBackground'
          }>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Icon
              name={icon}
              size={size}
              color={
                disabled
                  ? 'buttonTextDisabled'
                  : focused
                  ? 'buttonTextFocused'
                  : 'buttonText'
              }
            />
          )}
        </Box>
      )}
    </Pressable>
  );
}
