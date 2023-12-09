import Icon from '../../icon';
import {IconName} from '../../icon/icon';
import {Pressable} from './pressable';
import Box from '../../box';

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  focusOnMount?: boolean;
  disabled?: boolean;
}

export function IconButton({
  icon,
  onPress,
  focusOnMount,
  disabled,
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
        </Box>
      )}
    </Pressable>
  );
}
