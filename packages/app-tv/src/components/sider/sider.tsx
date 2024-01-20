import {useCallback, useMemo, useState} from 'react';
import {DevSettings, StyleSheet, View} from 'react-native';
import Animated from 'react-native-reanimated';
import {color, shadows, spacing} from '../../services/constants';
import {useNavigate} from '../../screens/params';
import {IconName} from '../ui/display/icon/icon';
import {StatusContext} from '../../services/contexts/status.context';
import {useAnimatedValue} from '../../services/hooks/useAnimatedValue';
import {useMeshContext} from '../../services/contexts/mesh.context';
import {SiderButton} from './siderButton';
import {StatusLine} from './statusLine';

export function Sider() {
  const {navigate} = useNavigate();

  const buttons = useMemo(() => {
    const options: {title: string; do: () => void; icon: IconName}[] = [
      {
        icon: 'home',
        title: 'Ajouté récement',
        do: () => navigate('Library', undefined),
      },
      {
        icon: 'magnify',
        title: 'Rechercher',
        do: () => navigate('Search', undefined),
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
      {
        icon: 'cog',
        title: 'Paramètres',
        do: () => navigate('Settings', undefined),
      },
    ];
    if (__DEV__) {
      options.push({
        icon: 'refresh',
        title: 'Reload',
        do: () => DevSettings.reload(),
      });
    }
    return options;
  }, [navigate]);

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

  const onFocus = useCallback(() => setFocused(o => o + 1), []);
  const onBlur = useCallback(
    () => setTimeout(() => setFocused(o => Math.max(0, o - 1)), 0),
    [],
  );

  const {status} = useMeshContext(StatusContext);

  const renderedButtons = useMemo(
    () =>
      buttons.map((button, index) => (
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
      )),
    [buttons, getDownNameFromIndex, getUpNameFromIndex, onBlur, onFocus],
  );

  return (
    <View style={[styles.root, focused ? styles.over : undefined]}>
      <Animated.View style={[styles.container, shadows.default, widthStyle]}>
        {renderedButtons}
        <View style={styles.status}>
          <StatusLine
            extended={isOpen}
            title="Serveur"
            status={status?.server ?? false}
          />
          <StatusLine
            extended={isOpen}
            title="Indexeur"
            status={status?.torrentIndexer ?? false}
          />
          <StatusLine
            extended={isOpen}
            title="Client"
            status={status?.torrentClient ?? false}
          />
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
    backgroundColor: color.darkBackground,
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
