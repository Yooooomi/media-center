import {
  TouchableOpacity,
  StyleSheet,
  TouchableOpacityProps,
  ActivityIndicator,
} from 'react-native';
import {color, radius, spacing} from '../../services/constants';
import {useMemo} from 'react';
import Text from '../text/text';

type ButtonType = 'primary' | 'secondary';

interface ButtonProps extends TouchableOpacityProps {
  type: ButtonType;
  text: string;
  loading?: boolean;
}

export default function Button({
  type,
  text,
  loading,
  disabled,
  ...other
}: ButtonProps) {
  const style = useMemo(() => [styles.base, styles[type]], [type]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || loading}
      style={style}
      {...other}>
      {loading && <ActivityIndicator style={styles.loading} />}
      <Text bold>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: spacing.S8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.small,
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: color.black,
    color: color.white,
  },
  secondary: {
    backgroundColor: color.white,
    color: color.black,
  },
  loading: {
    marginRight: spacing.S4,
  },
});
