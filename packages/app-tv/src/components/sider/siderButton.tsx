import {radius, spacing} from '../../services/constants';
import {IconName} from '../icon/icon';
import {StyleSheet, View} from 'react-native';
import {Pressable} from '../ui/pressable/pressable';
import {Icon} from '../icon';
import {Text} from '../text/text';
import {Box} from '../box';

interface SiderButtonProps {
  text: string;
  icon: IconName;
  onPress: () => void;
  onFocus: () => void;
  onBlur: () => void;
  upName: string;
  downName: string;
}

export function SiderButton({
  text,
  icon,
  onPress,
  onBlur,
  onFocus,
  upName,
  downName,
}: SiderButtonProps) {
  return (
    <View style={styles.root}>
      <Pressable
        onPress={onPress}
        onFocus={onFocus}
        onBlur={onBlur}
        name={text}
        up={() => upName}
        down={() => downName}
        style={styles.pressable}>
        {({focused}) => (
          <Box
            row
            p="S4"
            gap="S24"
            r="default"
            bg={focused ? 'buttonBackgroundFocused' : 'buttonBackground'}
            items="center">
            <Icon
              color={focused ? 'buttonTextFocused' : 'buttonText'}
              size={24}
              name={icon}
            />
            <Text
              color={focused ? 'buttonTextFocused' : 'buttonText'}
              numberOfLines={1}>
              {text}
            </Text>
          </Box>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.S8,
    padding: spacing.S8,
    borderRadius: radius.default,
    overflow: 'hidden',
  },
  pressable: {
    flexGrow: 1,
    marginLeft: -6,
  },
});
