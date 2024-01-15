import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {Box} from '../box';
import {Icon, IconName} from '../icon/icon';
import {BoxProps} from '../box/box';
import {ReactNode} from 'react';
import {noop} from '@media-center/algorithm';
import {ScaleButton} from '../ui/pressable/scaleButton';
import {radius} from '../../services/constants';
import {Text} from '../text';

interface BigPressableProps {
  disabled?: boolean;
  onPress: () => void;
  icon: IconName;
  text: string;
  loading?: boolean;
  bg?: BoxProps['bg'];
  children?: ReactNode;
  focusOnMount?: boolean;
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
}: BigPressableProps) {
  return (
    <View style={styles.container}>
      <ScaleButton
        border="default"
        focusOnMount={focusOnMount}
        onPress={disabled ? noop : onPress}>
        <Box items="center" content="center" style={styles.aspect}>
          <Box bg={bg ?? ['whiteText', 0.3]} style={styles.background} />
          {children ? (
            children
          ) : !loading ? (
            <Icon name={icon} size={30} />
          ) : (
            <ActivityIndicator size={30} />
          )}
        </Box>
      </ScaleButton>
      <Text size="small" style={styles.text}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.default,
    zIndex: 1,
    flex: 1,
  },
  aspect: {
    flexGrow: 1,
    aspectRatio: 16 / 10,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.default,
    overflow: 'hidden',
  },
  text: {
    marginTop: 2,
    textAlign: 'center',
  },
});
