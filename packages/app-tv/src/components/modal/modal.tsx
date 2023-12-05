import {ReactNode, useCallback} from 'react';
import {View, StyleSheet, Modal as RNModal} from 'react-native';
import {color, opacify, radius, spacing} from '../../services/constants';
import {useBack} from '../../services/useBack';
import Box from '../box';
import Text from '../text/text';

interface ModalProps {
  title: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
}

export default function Modal({children, open, title, onClose}: ModalProps) {
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
    <RNModal
      visible={open}
      onRequestClose={onClose}
      transparent
      animationType="fade">
      <Box items="center" content="center" grow style={styles.back}>
        <Box mb="S16" row content="center">
          <Text bold color="whiteText">
            {title}
          </Text>
        </Box>
        <View style={styles.content}>{children}</View>
      </Box>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  back: {
    backgroundColor: opacify('background', 0.5),
  },
  content: {
    maxHeight: 400,
    overflow: 'hidden',
    width: '80%',
    backgroundColor: color.background,
    borderRadius: radius.big,
    // shadowColor: color.black,
    // shadowRadius: 8,
    // shadowOffset: {height: -2, width: 0},
    // shadowOpacity: 0.2,
    padding: spacing.S16,
  },
});
