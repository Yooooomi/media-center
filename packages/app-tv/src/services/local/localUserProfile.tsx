import {Optional, Shape} from '@media-center/domain-driven';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {localStore} from '../localStore';
import {Beta} from '../api';
import {GetDeclaredUsersQuery} from '@media-center/server/src/domains/user/applicative/getDeclaredUsers.query';
import {useRender} from '../useRender';

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

    Beta.setServer(storedUser.serverAddress, storedUser.serverPassword);
    const serverUsers = await Beta.query(new GetDeclaredUsersQuery());
    setDeclaredUsers(serverUsers);
    const declaredStoredUser = serverUsers.find(u => u === storedUser?.user);
    storedUser.setUser(declaredStoredUser);
    render();
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
