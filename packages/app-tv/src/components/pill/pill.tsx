import {StyleSheet, View} from 'react-native';
import Text, {Accepted} from '../text/text';
import {color, radius, rawColor, spacing} from '../../services/constants';
import Box, {BoxProps} from '../box/box';

interface PillProps extends BoxProps {
  children: Accepted | Accepted[];
}

export default function Pill({children, style, ...other}: PillProps) {
  return (
    <Box style={{...styles.root, ...style}} {...other}>
      <View style={styles.background} />
      <Text size="tiny">{children}</Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.default,
    borderColor: rawColor.white,
    borderWidth: 1,
    height: 14,
    paddingHorizontal: spacing.S4,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: color.lightBackground,
    borderRadius: radius.default - 2,
    opacity: 0.6,
  },
});

// export default function Pill({children, ...other}: PillProps) {
//   return (
//     <Box r="max" bg="grey" h={20} ph="S4" content="center" {...other}>
//       <Text
//         size="small"
//         color="darkgrey"
//         style={{transform: [{translateY: -1}]}}>
//         {children}
//       </Text>
//     </Box>
//   );
// }
