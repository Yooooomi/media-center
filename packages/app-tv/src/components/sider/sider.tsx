import {useCallback, useMemo, useState} from 'react';
import {SiderButton} from './siderButton';
import {color, shadows, spacing} from '../../services/constants';
import {StyleSheet, View} from 'react-native';
import {useNavigate} from '../../screens/params';
import {IconName} from '../icon/icon';
import {Dot} from '../dot';
import Box from '../box/box';
import Text from '../text/text';
import {StatusContext} from '../../contexts/statusContext';
import {useAnimatedValue} from '../../services/useAnimatedValue';
import Animated from 'react-native-reanimated';

export default function Sider() {
  const navigate = useNavigate();

  const buttons = useMemo<{title: string; do: () => void; icon: IconName}[]>(
    () => [
      {
        icon: 'new-box',
        title: 'Ajouté récement',
        do: () => navigate('Library', undefined),
      },
      {
        icon: 'magnify',
        title: 'Rechercher',
        do: () => navigate('Search', undefined),
      },
      {
        icon: 'magnify-scan',
        title: 'Rechercher manuellement',
        do: () => navigate('SearchTorrent', undefined),
      },
      {
        icon: 'eye',
        title: 'Découvrir',
        do: () => navigate('Discover', undefined),
      },
      {
        icon: 'movie',
        title: 'Vos films',
        do: () => navigate('Movies', undefined),
      },
      {
        icon: 'projector',
        title: 'Vos séries',
        do: () => navigate('Shows', undefined),
      },
    ],
    [navigate],
  );

  const getUpNameFromIndex = useCallback(
    (index: number) => {
      index = (index - 1 + buttons.length) % buttons.length;
      return buttons[index]!.title;
    },
    [buttons],
  );

  const getDownNameFromIndex = useCallback(
    (index: number) => {
      index = (index + 1) % buttons.length;
      return buttons[index]!.title;
    },
    [buttons],
  );

  const [focused, setFocused] = useState(0);

  const closedWidth = 24 + 2 * spacing.S16;
  const openWidth = 250;
  const isOpen = focused > 0;

  const widthStyle = useAnimatedValue(isOpen ? openWidth : closedWidth);

  const onFocus = () => setFocused(o => o + 1);
  const onBlur = () => setTimeout(() => setFocused(o => o - 1), 0);

  return (
    <View style={[styles.root, focused ? styles.over : undefined]}>
      <Animated.View style={[styles.container, shadows.default, widthStyle]}>
        {buttons.map((button, index) => (
          <SiderButton
            key={button.title}
            icon={button.icon}
            text={button.title}
            onPress={button.do}
            onFocus={onFocus}
            onBlur={onBlur}
            upName={getUpNameFromIndex(index)}
            downName={getDownNameFromIndex(index)}
          />
        ))}
        <View style={styles.status}>
          <Box row ml="S16" mb="S16" gap="S8" items="center">
            <Dot color={StatusContext.server.value ? 'statusOK' : 'statusKO'} />
            {isOpen && <Text size="small">Serveur</Text>}
          </Box>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 1,
    width: 24 + 2 * spacing.S16,
    height: '100%',
  },
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'column',
    gap: spacing.S4,
    paddingLeft: spacing.S8,
    paddingTop: spacing.S16,
    paddingRight: spacing.S8,
    backgroundColor: color.background,
    overflow: 'hidden',
  },
  above: {
    zIndex: 2,
  },
  status: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  over: {
    zIndex: 1000,
  },
});
