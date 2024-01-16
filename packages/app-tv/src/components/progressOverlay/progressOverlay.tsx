import {ReactNode} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {color, radius, spacing} from '../../services/constants';
import {Icon} from '../icon';

interface ProgressOverlayProps {
  progress?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ProgressOverlay({
  children,
  progress,
  style,
}: ProgressOverlayProps) {
  return (
    <View style={style}>
      {children}
      {progress ? (
        <View
          style={[styles.progress, {width: `${Math.floor(progress * 100)}%`}]}
        />
      ) : null}
      {progress && progress === 0.9 ? (
        <View style={styles.finishedWrapper}>
          <Icon name="check" size={16} color="whiteText" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  progress: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 5,
    bottom: 0,
    backgroundColor: color.progress,
  },
  finishedWrapper: {
    borderRadius: radius.max,
    backgroundColor: color.progress,
    position: 'absolute',
    top: spacing.S12,
    right: spacing.S12,
  },
});
