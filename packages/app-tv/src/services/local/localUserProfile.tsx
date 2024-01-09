import {Optional, Shape} from '@media-center/domain-driven';
import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import {localStore} from '../localStore';
import {Beta} from '../api';
import {GetDeclaredUsersQuery} from '@media-center/server/src/domains/user/applicative/getDeclaredUsers.query';
import {UserId} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfoId';
import {ReactiveShape} from './reactiveContext';
import {Box} from '../../components/box';
import {FullScreenLoading} from '../../components/fullScreenLoading';
import {TextButton} from '../../components/ui/pressable/textButton';
import {ChooseUser} from '../../screens/chooseUser';
import {ConfigureServer} from '../../screens/configureServer';
import {Text} from '../../components/text';

export class LocalUserProfile extends Shape({
  user: Optional(String),
  serverAddress: Optional(String),
  serverPassword: Optional(String),
}) {
  setUser(user: string | undefined) {
    this.user = user;
  }

  setServerAddress(serverAddress: string) {
    this.serverAddress = serverAddress;
  }

  setServerPassword(serverPassword: string) {
    this.serverPassword = serverPassword;
  }
}

export const LocalUserContext = React.createContext<
  ReactiveShape<LocalUserProfile | undefined>
>({} as any);

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
    try {
      const storedUser =
        (await localStore.get('user', LocalUserProfile)) ??
        new LocalUserProfile({});

      reactive.updateInstance(storedUser);

      if (!storedUser.serverAddress || !storedUser.serverPassword) {
        return;
      }

      Beta.setServer(
        storedUser.serverAddress,
        storedUser.serverPassword,
        storedUser.user ? new UserId(storedUser.user) : undefined,
      );
      const serverUsers = await Beta.query(new GetDeclaredUsersQuery());
      setDeclaredUsers(serverUsers);
      const declaredStoredUser = serverUsers.find(u => u === storedUser?.user);
      storedUser.setUser(declaredStoredUser);
    } catch (e) {
      setError(e as Error);
    }
  }, [reactive]);

  useEffect(() => {
    init().catch(console.error);
  }, [init]);

  if (error) {
    return (
      <Box grow items="center" content="center">
        <Text>Erreur d'accès au server</Text>
        <Text size="small">{error.message}</Text>
        <Box mt="S8">
          <TextButton text="Réessayer" onPress={init} focusOnMount />
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
        onConfigured={(address, password) => {
          if (!reactive.instance) {
            return;
          }
          reactive.call('setServerAddress', address);
          reactive.call('setServerPassword', password);
          localStore.set('user', reactive.instance);
        }}
      />
    );
  }

  if (!declaredUsers) {
    return <FullScreenLoading />;
  }

  if (!reactive.instance) {
    return (
      <ChooseUser
        declaredUsers={declaredUsers}
        chooseUser={selected => {
          if (!reactive.instance) {
            return;
          }
          reactive.call('setUser', selected);
          localStore.set('user', reactive.instance);
        }}
      />
    );
  }

  return (
    <LocalUserContext.Provider value={reactive}>
      {children}
    </LocalUserContext.Provider>
  );
}
