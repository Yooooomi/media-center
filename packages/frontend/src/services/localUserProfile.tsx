import { Optional, Shape } from "@media-center/domain-driven";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { GetDeclaredUsersQuery } from "@media-center/domains/src/user/applicative/getDeclaredUsers.query";
import { UserId } from "@media-center/domains/src/userTmdbInfo/domain/userTmdbInfoId";
import { Box } from "../components/ui/display/box";
import { FullScreenLoading } from "../components/ui/display/fullScreenLoading";
import { TextButton } from "../components/ui/input/pressable/textButton";
import { ChooseUser } from "../screens/chooseUser";
import { ConfigureServer } from "../screens/configureServer";
import { Text } from "../components/ui/input/text";
import { ReactiveShape } from "./contexts/reactive.context";
import { localStore } from "./localStore";
import { Beta } from "./api/api";
import { DI_HOOKS } from "./di/injectHook";
import { isTV } from "./platform";

export class LocalUserProfile extends Shape({
  user: Optional(String),
  serverAddress: Optional(String),
  serverPassword: Optional(String),
}) {
  setUser(user: string | undefined) {
    this.user = user;
  }

  resetUser() {
    this.user = undefined;
  }

  resetServer() {
    this.serverAddress = undefined;
    this.serverPassword = undefined;
  }

  setServerAddress(serverAddress: string) {
    console.log("Setting address", serverAddress);
    this.serverAddress = serverAddress;
  }

  setServerPassword(serverPassword: string) {
    console.log("Setting password", serverPassword);
    this.serverPassword = serverPassword;
  }
}

export const LocalUserContext = createContext<{
  user: ReactiveShape<LocalUserProfile | undefined>;
  save: () => void;
}>({} as any);

interface LocalUserContextProviderProps {
  children: ReactNode;
}

export function LocalUserContextProvider({
  children,
}: LocalUserContextProviderProps) {
  const [error, setError] = useState<Error | undefined>(undefined);
  const reactive = ReactiveShape.use<LocalUserProfile | undefined>(undefined);
  const [declaredUsers, setDeclaredUsers] = useState<string[] | undefined>(
    undefined,
  );

  const init = useCallback(async () => {
    setError(undefined);
    try {
      const storedUser =
        (await localStore.get("user", LocalUserProfile)) ??
        new LocalUserProfile({});

      reactive.updateInstance(storedUser);

      if (!storedUser.serverAddress || !storedUser.serverPassword) {
        DI_HOOKS.trigger("OnLoginError");
        return;
      }

      if (!storedUser.user) {
        DI_HOOKS.trigger("OnLoginError");
      }

      Beta.setServer(
        storedUser.serverAddress,
        storedUser.serverPassword,
        storedUser.user ? new UserId(storedUser.user) : undefined,
      );
      const serverUsers = await Beta.query(new GetDeclaredUsersQuery());
      setDeclaredUsers(serverUsers);
      const declaredStoredUser = serverUsers.find(
        (u) => u === storedUser?.user,
      );
      storedUser.setUser(declaredStoredUser);
    } catch (e) {
      console.log(e);
      DI_HOOKS.trigger("OnLoginError");
      setError(e as Error);
    }
  }, [reactive]);

  useEffect(() => {
    async function callInit() {
      await init();
      if (__DEV__ && isTV()) {
        // reactive.call("setServerAddress", "http://192.168.1.153:8080");
        // reactive.call("setServerPassword", "somerandompassword");
        if (!reactive.instance) {
          return;
        }
        await localStore.set("user", reactive.instance);
        await init();
      }
    }
    callInit().catch(console.error);
  }, [init, reactive]);

  const value = useMemo(
    () => ({
      user: reactive,
      save: async () => {
        if (!reactive.instance) {
          return;
        }
        await localStore.set("user", reactive.instance);
        if (
          !reactive.instance.serverAddress ||
          !reactive.instance.serverPassword
        ) {
          return;
        }
        Beta.setServer(
          reactive.instance.serverAddress,
          reactive.instance.serverPassword,
          reactive.instance.user
            ? new UserId(reactive.instance.user)
            : undefined,
        );
      },
    }),
    [reactive],
  );

  if (error) {
    return (
      <Box grow items="center" content="center" bg="background">
        <Text align="center">
          Erreur d'accès au server {reactive.instance?.serverAddress}
        </Text>
        <Text size="small">{error.message}</Text>
        <Box mt="S8">
          <TextButton text="Réessayer" onPress={init} focusOnMount />
          <TextButton
            text="Changer de serveur"
            variant="delete"
            onPress={() => {
              reactive.updateInstance(new LocalUserProfile({}));
              setError(undefined);
            }}
          />
        </Box>
      </Box>
    );
  }

  if (!reactive.instance) {
    return <FullScreenLoading />;
  }

  if (!reactive.instance?.serverAddress || !reactive.instance?.serverPassword) {
    return (
      <ConfigureServer
        onConfigured={async (address, password) => {
          if (!reactive.instance) {
            return;
          }
          reactive.call("setServerAddress", address);
          reactive.call("setServerPassword", password);
          await localStore.set("user", reactive.instance);
          init().catch(console.error);
        }}
      />
    );
  }

  if (!declaredUsers) {
    return <FullScreenLoading />;
  }

  if (!reactive.instance.user) {
    return (
      <ChooseUser
        declaredUsers={declaredUsers}
        chooseUser={(selected) => {
          if (
            !reactive.instance ||
            !reactive.instance.serverAddress ||
            !reactive.instance.serverPassword
          ) {
            return;
          }
          reactive.call("setUser", selected);
          localStore.set("user", reactive.instance).catch(console.error);
          Beta.setServer(
            reactive.instance.serverAddress,
            reactive.instance.serverPassword,
            new UserId(selected),
          );
        }}
      />
    );
  }

  return (
    <LocalUserContext.Provider value={value}>
      {children}
    </LocalUserContext.Provider>
  );
}

export function useLocalUser() {
  const { user, save } = useContext(LocalUserContext);

  const resetAccount = useCallback(() => {
    user.call("resetUser");
    save();
  }, [save, user]);

  const resetServer = useCallback(() => {
    user.call("resetServer");
    save();
  }, [save, user]);

  return { user, resetAccount, resetServer };
}
