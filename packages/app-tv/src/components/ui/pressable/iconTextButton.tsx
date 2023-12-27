import {StyleSheet} from 'react-native';
import {fontSize} from '../../../services/constants';
import Box from '../../box';
import Icon from '../../icon';
import {IconName} from '../../icon/icon';
import Text from '../../text';
import {Pressable} from './pressable';

interface IconTextButtonProps {
  icon: IconName;
  iconSize: number;
  text: string;
  textSize: keyof typeof fontSize;
  onPress: () => void;
  focusOnMount?: boolean;
}

export function IconTextButton({
  icon,
  iconSize,
  text,
  textSize,
  onPress,
  focusOnMount,
}: IconTextButtonProps) {
  return (
    <Pressable
      focusOnMount={focusOnMount}
      onPress={onPress}
      style={styles.root}>
      {({focused}) => (
        <Box
          grow
          p="S8"
          r="default"
          bg={focused ? 'buttonBackgroundFocused' : 'buttonBackground'}
          items="center"
          content="center">
          <Icon
            color={focused ? 'buttonTextFocused' : 'buttonText'}
            size={iconSize}
            name={icon}
          />
          <Text
            color={focused ? 'buttonTextFocused' : 'buttonText'}
            size={textSize}>
            {text}
          </Text>
        </Box>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
  },
});
