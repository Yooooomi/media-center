import {StyleSheet, View} from 'react-native';
import {Text} from '../text';
import {color, radius, rawColor, spacing} from '../../../../services/constants';
import {Pressable} from './pressable';

interface TabButtonProps {
  text: string;
  selected: boolean;
  onPress: () => void;
}

export function TabButton({text, selected, onPress}: TabButtonProps) {
  return (
    <Pressable onPress={onPress}>
      {({focused}) => (
        <View>
          <View
            style={[
              styles.base,
              focused ? styles.focused : undefined,
              selected
                ? focused
                  ? styles.selectedFocused
                  : styles.selected
                : focused
                ? styles.unselectedFocused
                : styles.unselected,
            ]}>
            <Text color={focused ? 'buttonTextFocused' : 'buttonText'}>
              {text}
            </Text>
          </View>
          <View
            style={[
              styles.bar,
              selected ? styles.barSelected : styles.barUnselected,
            ]}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: spacing.S2,
  },
  focused: {
    borderRadius: radius.small,
    backgroundColor: rawColor.white,
  },
  selected: {
    borderBottomColor: color.whiteText,
  },
  selectedFocused: {
    borderBottomColor: rawColor.white,
  },
  unselected: {
    borderBottomColor: rawColor.transparent,
  },
  unselectedFocused: {},
  bar: {
    marginTop: spacing.S4,
    width: '100%',
    height: 2,
  },
  barSelected: {
    backgroundColor: rawColor.white,
  },
  barUnselected: {
    backgroundColor: rawColor.transparent,
  },
});
