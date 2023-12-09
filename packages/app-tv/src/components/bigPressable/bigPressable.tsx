import {ActivityIndicator, StyleSheet, View} from 'react-native';
import Box from '../box';
import Icon, {IconName} from '../icon/icon';
import {BoxProps} from '../box/box';
import {ReactNode} from 'react';
import {BlurView} from '@react-native-community/blur';
import {noop} from '@media-center/algorithm';
import {ScaleButton} from '../ui/pressable/scaleButton';
import {radius} from '../../services/constants';

interface BigPressableProps {
  disabled?: boolean;
  onPress: () => void;
  icon: IconName;
  loading?: boolean;
  bg?: BoxProps['bg'];
  children?: ReactNode;
  focusOnMount?: boolean;
}

export function BigPressable({
  disabled,
  onPress,
  bg = 'buttonBackground',
  loading,
  icon,
  children,
  focusOnMount,
}: BigPressableProps) {
  return (
    <ScaleButton
      border="big"
      focusOnMount={focusOnMount}
      onPress={disabled ? noop : onPress}>
      <Box style={styles.container} bg={bg}>
        <BlurView overlayColor="transparent" style={styles.blur} />
        <View style={styles.icon}>
          {children ? (
            children
          ) : !loading ? (
            <Icon name={icon} size={48} />
          ) : (
            <ActivityIndicator size={48} />
          )}
        </View>
      </Box>
    </ScaleButton>
  );
}

const BUTTON_SIZE = {
  width: (190 * 2) / 3,
  height: (120 * 2) / 3,
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.big,
    overflow: 'hidden',
    zIndex: 1,
    ...BUTTON_SIZE,
  },
  blur: {
    ...BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    position: 'absolute',
    top: BUTTON_SIZE.height / 2 - 48 / 2,
    left: BUTTON_SIZE.width / 2 - 48 / 2,
  },
});
