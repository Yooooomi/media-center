import { ReactNode, useCallback, useState } from "react";
import { StatusQuery } from "@media-center/domains/src/queries/status.query";
import { Beta } from "../api";
import { createMeshContext, useMeshContextSetup } from "./mesh.context";

interface Status {
  server: boolean;
  torrentIndexer: boolean;
  torrentClient: boolean;
}

export interface StatusContext {
  status: Status | undefined;
  initStatus: () => void;
}

export const StatusContext = createMeshContext<StatusContext>();

interface StatusContextProviderProps {
  children: ReactNode;
}

export function StatusContextProvider({
  children,
}: StatusContextProviderProps) {
  const [status, setStatus] = useState<Status | undefined>(undefined);

  const initStatus = useCallback(async () => {
    try {
      const newStatus = await Beta.query(new StatusQuery());
      setStatus({
        server: true,
        torrentClient: newStatus.torrentClientStatus,
        torrentIndexer: newStatus.torrentIndexerStatus,
      });
    } catch (e) {
      setStatus({ server: false, torrentClient: false, torrentIndexer: false });
    }
  }, []);

  const value = useMeshContextSetup<StatusContext>({ status, initStatus });

  return (
    <StatusContext.Provider value={value}>{children}</StatusContext.Provider>
  );
}
