import {PressableStateCallbackType, StyleProp, ViewStyle} from 'react-native';

export function combineStyles(
  ...styles: (
    | StyleProp<ViewStyle>
    | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>)
  )[]
) {
  return (state: PressableStateCallbackType) =>
    styles.map(s => (typeof s === 'function' ? s(state) : s));
}
