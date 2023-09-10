import {ReactNode, useCallback} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Portal} from '../portal';
import Box from '../box/box';
import Text from '../text/text';
import {color, radius, spacing} from '../../services/constants';
import Animated, {SlideInDown, SlideOutDown} from 'react-native-reanimated';
import {useBack} from '../../services/useBack';

interface ActionSheetProps {
  title: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
}

export default function ActionSheet({
  children,
  open,
  title,
  onClose,
}: ActionSheetProps) {
  useBack(
    useCallback(() => {
      if (open) {
        onClose();
        return true;
      }
      return false;
    }, [onClose, open]),
  );

  return (
    <>
      {open && (
        <Portal>
          <Animated.View
            style={styles.root}
            entering={SlideInDown}
            exiting={SlideOutDown}>
            <View style={styles.content}>
              <Box content="center" items="center" p="S8">
                <Text bold color="black" size="default">
                  {title}
                </Text>
              </Box>
              <ScrollView contentInsetAdjustmentBehavior="automatic">
                {children}
              </ScrollView>
            </View>
          </Animated.View>
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    maxHeight: 400,
    width: '40%',
    backgroundColor: color.white,
    borderTopLeftRadius: radius.big,
    borderTopRightRadius: radius.big,
    shadowColor: color.black,
    shadowRadius: 8,
    shadowOffset: {height: -2, width: 0},
    shadowOpacity: 0.2,
    paddingBottom: spacing.S32,
  },
});
