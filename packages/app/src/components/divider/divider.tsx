import {StyleSheet, View, ViewStyle} from 'react-native';
import {color} from '../../services/constants';

interface DividerProps {
  width: ViewStyle['width'];
}

export default function Divider({width}: DividerProps) {
  return <View style={[styles.root, {width}]} />;
}

const styles = StyleSheet.create({
  root: {
    height: 1,
    backgroundColor: color.grey,
  },
});
