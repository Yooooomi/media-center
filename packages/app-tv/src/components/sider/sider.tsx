import {useMemo, useRef, useState} from 'react';
import SiderButton from './siderButton';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {color, durations, shadows, spacing} from '../../services/constants';
import {StyleSheet, View} from 'react-native';
import {useNavigate} from '../../screens/params';
import {IconName} from '../icon/icon';
import {Dot} from '../dot';
import Box from '../box/box';
import Text from '../text/text';
import {StatusContext} from '../../contexts/statusContext';

function ensureInArray(index: number, arrayLength: number) {
  if (index < 0) {
    return arrayLength - 1;
  }
  return index % arrayLength;
}

export default function Sider() {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(0);
  const [animState, setAnimState] = useState(false);
  const directions = useRef<(number | null)[]>([]);

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

  const onFocus = () => setFocused(old => old + 1);
  const onBlur = () => setTimeout(() => setFocused(old => old - 1), 0);

  const closedWidth = 24 + 2 * spacing.S16;
  const openWidth = 250;
  const widthStyle = useAnimatedStyle(() => {
    runOnJS(setAnimState)(true);
    return {
      width: withTiming(
        focused <= 0 ? closedWidth : openWidth,
        {
          duration: durations.default,
        },
        finished => {
          if (!finished) {
            return;
          }
          runOnJS(setAnimState)(focused > 0);
        },
      ),
    };
  });

  return (
    <View style={[styles.root, animState ? styles.above : undefined]}>
      <Animated.View style={[styles.container, widthStyle, shadows.default]}>
        {buttons.map((button, index) => (
          <SiderButton
            key={button.title}
            getKey={k => (directions.current[index] = k)}
            icon={button.icon}
            text={button.title}
            onBlur={onBlur}
            onFocus={onFocus}
            onPress={button.do}
            nextFocusDown={
              directions.current[ensureInArray(index + 1, buttons.length)] ??
              null
            }
            nextFocusUp={
              directions.current[ensureInArray(index - 1, buttons.length)] ??
              null
            }
          />
        ))}
        <View style={styles.status}>
          <Box row ml="S16" mb="S16" gap="S8" items="center">
            <Dot color={StatusContext.server.value ? 'statusOK' : 'statusKO'} />
            {animState && <Text size="small">Serveur</Text>}
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
    gap: spacing.S8,
    paddingLeft: spacing.S8,
    paddingTop: spacing.S16,
    paddingRight: spacing.S8,
    backgroundColor: color.background,
  },
  above: {
    zIndex: 2,
  },
  status: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
});
