import Icon from '../../icon';
import {IconName} from '../../icon/icon';
import {Pressable} from './pressable';
import Box from '../../box';
import {ActivityIndicator} from 'react-native';

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  focusOnMount?: boolean;
  disabled?: boolean;
  loading: boolean;
}

export function IconButton({
  icon,
  onPress,
  focusOnMount,
  disabled,
  loading,
}: IconButtonProps) {
  return (
    <Pressable onPress={onPress} focusOnMount={focusOnMount}>
      {({focused}) => (
        <Box
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
