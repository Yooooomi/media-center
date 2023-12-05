import {ActivityIndicator, StyleSheet} from 'react-native';
import {radius} from '../../services/constants';
import Box from '../box';
import Pressable from '../pressable/pressable';
import Icon, {IconName} from '../icon/icon';
import {BoxProps} from '../box/box';
import {ReactNode} from 'react';
import {BlurView} from '@react-native-community/blur';

interface BigPressableProps {
  disabled?: boolean;
  onPress: () => void;
  icon: IconName;
  loading?: boolean;
  bg: BoxProps['bg'];
  children?: ReactNode;
  hasTVPreferredFocus?: boolean;
}

export function BigPressable({
  disabled,
  onPress,
  bg,
  loading,
  icon,
  children,
  hasTVPreferredFocus,
}: BigPressableProps) {
  return (
    <Pressable
      hasTVPreferredFocus={hasTVPreferredFocus}
      onPress={disabled ? undefined : onPress}
      radius={radius.big}>
      <Box r="big" overflow="hidden" style={styles.bigInfo}>
        <BlurView overlayColor="transparent" style={styles.grow}>
          <Box grow bg={bg} items="center" content="center">
            {children ? (
              children
            ) : !loading ? (
              <Icon name={icon} size={48} />
            ) : (
              <ActivityIndicator size={48} />
            )}
          </Box>
        </BlurView>
      </Box>
    </Pressable>
  );
}

const BUTTON_SIZE = {
  width: (190 * 2) / 3,
  height: (120 * 2) / 3,
};

const styles = StyleSheet.create({
  bigInfo: {
    ...BUTTON_SIZE,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  grow: {
    flexGrow: 1,
  },
});
