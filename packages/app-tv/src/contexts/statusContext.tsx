import {ReactNode, useState} from 'react';
import {createMeshContext, useMeshContextSetup} from './meshContext';

export interface StatusContext {
  status: boolean;
  setStatus: (status: boolean) => void;
}

export const StatusContext = createMeshContext<StatusContext>();

interface StatusContextProviderProps {
  children: ReactNode;
}

export function StatusContextProvider({children}: StatusContextProviderProps) {
  const [status, setStatus] = useState(true);

  const value = useMeshContextSetup<StatusContext>({status, setStatus});

  return (
    <StatusContext.Provider value={value}>{children}</StatusContext.Provider>
  );
}
