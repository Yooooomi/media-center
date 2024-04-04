import {
  NavigationContainer,
  useNavigation,
  useRoute,
  NavigationProp,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCallback } from "react";
import { SafeAreaView } from "react-native";
import { color } from "@media-center/ui/src/constants";
import { useBack } from "../services/hooks/useBack";
import { Box, PressableBox } from "../components/ui/display/box";
import { Icon } from "../components/ui/display/icon";
import { Text } from "../components/ui/input/text";
import { IconName } from "../components/ui/display/icon/icon.props";
import { RouterProps, RoutesProps } from "./navigation.native.props";
import { NavigationParams, paths } from "./params";
import { AddedRecently } from "./addedRecently";
import { Discover } from "./discover";
import { Movie } from "./movie";
import { Movies } from "./movies";
import { SearchTmdb } from "./searchTmdb";
import { SearchTorrent } from "./searchTorrent";
import { Show } from "./show";
import { Shows } from "./shows";
import { Watch } from "./watch";
import { Search } from "./search";
import { Settings } from "./settings";

const StackNavigator = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

interface BottomIconProps {
  onPress: () => void;
  text: string;
  icon: IconName;
}

function BottomIcon({ icon, onPress, text }: BottomIconProps) {
  return (
    <PressableBox items="center" onPress={onPress}>
      <Icon name={icon} size={32} />
      <Text size="tiny">{text}</Text>
    </PressableBox>
  );
}

function Bottom() {
  const { resetTo } = useNavigate();

  return (
    <Box bg="darkBackground">
      <Box w="100%" row content="space-around" items="center" pt="S8">
        <BottomIcon
          text="Récent"
          icon="home"
          onPress={() => resetTo("Library", undefined)}
        />
        <BottomIcon
          text="Séries"
          icon="projector"
          onPress={() => resetTo("Shows", undefined)}
        />
        <BottomIcon
          text="Films"
          icon="movie"
          onPress={() => resetTo("Movies", undefined)}
        />
        <BottomIcon
          text="Rechercher"
          icon="magnify"
          onPress={() => resetTo("Discover", undefined)}
        />
      </Box>
      <SafeAreaView />
    </Box>
  );
}

export function Routes(_props: RoutesProps) {
  return (
    <StackNavigator.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <StackNavigator.Screen name={paths.Library} component={AddedRecently} />
      <StackNavigator.Screen name={paths.Discover} component={Discover} />
      <StackNavigator.Screen name={paths.Movie} component={Movie} />
      <StackNavigator.Screen name={paths.Show} component={Show} />
      <StackNavigator.Screen
        name={paths.Watch}
        component={Watch}
        options={{
          presentation: "fullScreenModal",
        }}
      />
      <StackNavigator.Screen name={paths.Search} component={Search} />
      <StackNavigator.Screen name={paths.SearchTmdb} component={SearchTmdb} />
      <StackNavigator.Screen
        name={paths.SearchTorrent}
        component={SearchTorrent}
      />
      <StackNavigator.Screen name={paths.Movies} component={Movies} />
      <StackNavigator.Screen name={paths.Shows} component={Shows} />
      <StackNavigator.Screen name={paths.Settings} component={Settings} />
    </StackNavigator.Navigator>
  );
}

export function Router({ children }: RouterProps) {
  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        dark: false,
        colors: {
          background: color.background,
          text: color.whiteText,
          border: color.background,
          card: color.background,
          notification: color.background,
          primary: color.background,
        },
      }}
    >
      {children}
      <Bottom />
    </NavigationContainer>
  );
}

export function useParams<K extends keyof NavigationParams>() {
  return useRoute().params as NavigationParams[K];
}

export function useNavigate() {
  const { goBack, navigate, reset } =
    useNavigation<NavigationProp<NavigationParams>>();

  useBack(
    useCallback(() => {
      goBack();
      return true;
    }, [goBack]),
  );

  return {
    navigate: useCallback(
      <K extends keyof NavigationParams>(
        path: K,
        params: NavigationParams[K] extends undefined
          ? void
          : NavigationParams[K],
      ) => {
        navigate(paths[path] as any, params as any);
      },
      [navigate],
    ),
    goBack,
    resetTo: useCallback(
      <K extends keyof NavigationParams>(
        path: K,
        params: NavigationParams[K] extends undefined
          ? void
          : NavigationParams[K],
      ) => {
        reset({
          routes: [{ name: paths[path] as any, params: params as any }],
          index: 0,
        });
      },
      [reset],
    ),
  };
}
