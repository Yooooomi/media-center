import {ReactNode, useCallback} from 'react';
import {Modal, StyleSheet, View} from 'react-native';
import Box from '../box/box';
import {color, radius, spacing} from '../../services/constants';
import {useBack} from '../../services/useBack';
import Text from '../text/text';

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
    <Modal
      visible={open}
      onRequestClose={onClose}
      transparent
      animationType="fade">
      <Box items="center" content="center" grow style={styles.back}>
        <Box mb="S16" row content="center">
          <Text bold color="white">
            {title}
          </Text>
        </Box>
        <View style={styles.content}>{children}</View>
      </Box>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: {
    backgroundColor: `${color.black}69`,
  },
  content: {
    maxHeight: 400,
    overflow: 'hidden',
    width: '80%',
    backgroundColor: color.white,
    borderRadius: radius.big,
    shadowColor: color.black,
    shadowRadius: 8,
    shadowOffset: {height: -2, width: 0},
    shadowOpacity: 0.2,
    padding: spacing.S16,
  },
});
