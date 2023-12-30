import {StyleSheet} from 'react-native';
import Box from '../box';

export function DisabledFill() {
  return <Box style={StyleSheet.absoluteFillObject} bg={['error', 0.8]} />;
}
