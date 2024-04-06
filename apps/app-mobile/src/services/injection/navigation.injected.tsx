import {
  NavigationContainer,
  useNavigation,
  useRoute,
  NavigationProp,
  createNavigationContainerRef,
  RouteProp,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { ComponentProps, useCallback } from "react";
import { Platform, StyleSheet } from "react-native";
import { color, spacing } from "@media-center/ui/src/constants";
import {
  PressableBox,
  Box,
} from "@media-center/frontend/src/components/ui/display/box";
import { IconName } from "@media-center/frontend/src/components/ui/display/icon/icon.props";
import {
  NavigationParams,
  paths,
} from "@media-center/frontend/src/screens/params";
import { useBack } from "@media-center/frontend/src/services/hooks/useBack";
import { Text } from "@media-center/frontend/src/components/ui/input/text";
import { SafeOrPadding } from "@media-center/frontend/src/components/ui/display/safeOrPadding";
import { AddedRecently } from "@media-center/frontend/src/screens/addedRecently";
import { Discover } from "@media-center/frontend/src/screens/discover";
import { Movie } from "@media-center/frontend/src/screens/movie";
import { Show } from "@media-center/frontend/src/screens/show";
import { Watch } from "@media-center/frontend/src/screens/watch";
import { Search } from "@media-center/frontend/src/screens/search";
import { SearchTmdb } from "@media-center/frontend/src/screens/searchTmdb";
import { SearchTorrent } from "@media-center/frontend/src/screens/searchTorrent";
import { Movies } from "@media-center/frontend/src/screens/movies";
import { Shows } from "@media-center/frontend/src/screens/shows";
import { Settings } from "@media-center/frontend/src/screens/settings";
import {
  RouterProps,
  RoutesProps,
} from "@media-center/frontend/src/screens/navigation.props";
import { IconButton } from "@media-center/frontend/src/components/ui/input/pressable/iconButton";
import { Icon } from "@media-center/frontend/src/components/ui/display/icon";

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
      <Icon name={icon} size={26} />
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
          text="Paramètres"
          icon="cog"
          onPress={() => resetTo("Settings", undefined)}
        />
      </Box>
      <SafeOrPadding bottom={spacing.S8} />
    </Box>
  );
}

function HeaderBackground() {
  return (
    <BlurView
      experimentalBlurMethod="dimezisBlurView"
      tint="systemThickMaterialDark"
      style={styles.root}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
  },
});

type ScreenOptions = ComponentProps<
  typeof StackNavigator.Navigator
>["screenOptions"];

function generateOptionsForRoute<K extends keyof NavigationParams>(
  fn: (props: {
    route: RouteProp<NavigationParams, K>;
    navigation: any;
  }) => ScreenOptions,
): any {
  return fn;
}

function SearchHeaderButton() {
  const { navigate } = useNavigate();

  return (
    <IconButton
      size={24}
      icon="magnify"
      onPress={() => navigate("Search", undefined)}
    />
  );
}

export function Routes(_props: RoutesProps) {
  const options: ScreenOptions = {
    headerTransparent: true,
    headerBlurEffect: "systemUltraThinMaterialDark",
    title: "my title",
    headerBackground: HeaderBackground,
    headerRight: SearchHeaderButton,
  };

  return (
    <StackNavigator.Navigator
      initialRouteName={paths.Library}
      screenOptions={options}
    >
      <StackNavigator.Screen
        name={paths.Library}
        component={AddedRecently}
        options={{
          title: "Ma librairie",
        }}
      />
      <StackNavigator.Screen
        name={paths.Discover}
        component={Discover}
        options={{ title: "Découvrir" }}
      />
      <StackNavigator.Screen
        name={paths.Movie}
        component={Movie}
        options={generateOptionsForRoute<"Movie">(
          ({
            route: {
              params: { title },
            },
          }) => ({
            title,
          }),
        )}
      />
      <StackNavigator.Screen
        name={paths.Show}
        component={Show}
        options={generateOptionsForRoute<"Show">(
          ({
            route: {
              params: { title },
            },
          }) => ({
            title,
          }),
        )}
      />
      <StackNavigator.Screen
        name={paths.Watch}
        component={Watch}
        options={{
          headerShown: false,
          autoHideHomeIndicator: true,
          navigationBarHidden: true,
          statusBarHidden: Platform.select({ android: true }),
          header: () => null,
          headerTransparent: true,
          headerBlurEffect: undefined,
        }}
      />
      <StackNavigator.Screen
        name={paths.Search}
        component={Search}
        options={{
          title: "Rechercher",
          headerRight: undefined,
        }}
      />
      <StackNavigator.Screen
        name={paths.SearchTmdb}
        component={SearchTmdb}
        options={{
          title: "Rechercher média",
          headerRight: undefined,
        }}
      />
      <StackNavigator.Screen
        name={paths.SearchTorrent}
        component={SearchTorrent}
        options={{
          title: "Rechercher un torrent",
          headerRight: undefined,
        }}
      />
      <StackNavigator.Screen
        name={paths.Movies}
        component={Movies}
        options={{
          title: "Mes films",
        }}
      />
      <StackNavigator.Screen
        name={paths.Shows}
        component={Shows}
        options={{ title: "Mes séries" }}
      />
      <StackNavigator.Screen
        name={paths.Settings}
        component={Settings}
        options={{ title: "Paramètres" }}
      />
    </StackNavigator.Navigator>
  );
}

export function Router({ children }: RouterProps) {
  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        theme={{
          dark: false,
          colors: {
            background: color.background,
            text: color.whiteText,
            border: color.whiteText,
            card: color.whiteText,
            notification: color.whiteText,
            primary: color.whiteText,
          },
        }}
      >
        {children}
        <Bottom />
      </NavigationContainer>
    </SafeAreaProvider>
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
