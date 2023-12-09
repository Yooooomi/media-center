import {ReactNode} from 'react';
import {Pressable} from './pressable';
import {StyleSheet, View} from 'react-native';
import {color, radius, rawColor} from '../../../services/constants';

interface ScaleButtonProps {
  children: ReactNode;
  onPress: () => void;
  focusOnMount?: boolean;
  border?: boolean | keyof typeof radius;
}

export function ScaleButton({
  children,
  onPress,
  focusOnMount,
  border,
}: ScaleButtonProps) {
  return (
    <Pressable onPress={onPress} focusOnMount={focusOnMount}>
      {({focused}) => (
        <View
          style={[
            styles.root,
            {
              borderRadius:
                border && typeof border === 'string'
                  ? radius[border]
                  : radius.default,
              borderColor:
                border && focused ? color.whiteText : rawColor.transparent,
              transform: [{scale: focused ? 1.05 : 1}],
            },
          ]}>
          {children}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 2,
  },
});
