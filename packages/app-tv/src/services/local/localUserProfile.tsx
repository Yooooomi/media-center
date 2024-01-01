import {Optional, Shape} from '@media-center/domain-driven';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {localStore} from '../localStore';
import {Beta} from '../api';
import {GetDeclaredUsersQuery} from '@media-center/server/src/domains/user/applicative/getDeclaredUsers.query';
import {useRender} from '../useRender';
import {UserId} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfoId';

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

interface LocalUserProfileContext {
  user: LocalUserProfile | undefined;
  saveUser: () => Promise<void>;
  declaredUsers: string[] | undefined;
}

export const LocalUserProfileContext =
  React.createContext<LocalUserProfileContext>({} as any);

export function useLocalUserProfileContext() {
  const render = useRender();
  const [declaredUsers, setDeclaredUsers] = useState<string[] | undefined>(
    undefined,
  );
  const user = useRef<LocalUserProfile | undefined>(undefined);

  const init = useCallback(async () => {
    const storedUser =
      (await localStore.get('user', LocalUserProfile)) ??
      new LocalUserProfile({});
    user.current = storedUser;

    if (!storedUser.serverAddress || !storedUser.serverPassword) {
      render();
      return;
    }

    Beta.setServer(
      storedUser.serverAddress,
      storedUser.serverPassword,
      storedUser.user ? new UserId(storedUser.user) : undefined,
    );
    const serverUsers = await Beta.query(new GetDeclaredUsersQuery());
    const declaredStoredUser = serverUsers.find(u => u === storedUser?.user);
    storedUser.setUser(declaredStoredUser);
    setDeclaredUsers(serverUsers);
  }, [render]);

  const value: LocalUserProfileContext = {
    user: user.current,
    saveUser: async () => {
      if (!user.current) {
        return;
      }
      await localStore.set('user', user.current);
      await init();
    },
    declaredUsers,
  };

  useEffect(() => {
    init().catch(console.error);
  }, [init, render]);

  return value;
}
