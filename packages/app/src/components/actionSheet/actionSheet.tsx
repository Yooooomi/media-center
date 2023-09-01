import {ReactNode} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {Portal} from '../portal';
import Box from '../box/box';
import Text from '../text/text';
import {color, radius} from '../../services/constants';

interface ActionSheetProps {
  title: string;
  children: ReactNode;
  open: boolean;
}

export default function ActionSheet({children, open, title}: ActionSheetProps) {
  return (
    <>
      {open && (
        <Portal>
          <View style={styles.root}>
            <Box content="center" items="center" p="S8">
              <Text bold size="default">
                {title}
              </Text>
            </Box>
            <ScrollView contentInsetAdjustmentBehavior="automatic">
              {children}
            </ScrollView>
            <SafeAreaView />
          </View>
        </Portal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: 400,
    backgroundColor: color.white,
    borderTopLeftRadius: radius.big,
    borderTopRightRadius: radius.big,
    shadowColor: color.black,
    shadowRadius: 8,
    shadowOffset: {height: -2, width: 0},
    shadowOpacity: 0.2,
  },
});
