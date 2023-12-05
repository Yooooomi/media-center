import React, {
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import Alert from './alert';

interface AlertInfo<T extends string> {
  title: string;
  text: string;
  buttons: T[];
  onPress: (reason: T | undefined) => void;
}

const AlertContext = React.createContext<{
  alerts: AlertInfo<any>[];
  addAlert: (info: AlertInfo<any>) => void;
}>({
  alerts: [],
  addAlert: () => {},
});

interface AlertProviderProps {
  children: ReactNode;
}

export function useAlert() {
  const ctx = useContext(AlertContext);

  return useCallback(
    <T extends string>(info: Omit<AlertInfo<T>, 'onPress'>) => {
      return new Promise<T | undefined>(res => {
        ctx.addAlert({...info, onPress: res});
      });
    },
    [ctx],
  );
}

export default function AlertProvider({children}: AlertProviderProps) {
  const [alerts, setAlerts] = useState<AlertInfo<any>[]>([]);

  const onPress = useCallback((index: number, reason: string | undefined) => {
    setAlerts(old => {
      const newValue = [...old];
      const [removed] = newValue.splice(index, 1);
      removed?.onPress(reason);
      return newValue;
    });
  }, []);

  const addAlert = useCallback((info: AlertInfo<any>) => {
    setAlerts(old => [...old, info]);
  }, []);

  const value = useMemo(
    () => ({
      alerts,
      addAlert,
    }),
    [alerts, addAlert],
  );

  return (
    <>
      <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
      {alerts.map((a, index) => (
        <Alert
          key={a.title}
          title={a.title}
          text={a.text}
          buttons={a.buttons}
          onPress={reason => onPress(index, reason)}
        />
      ))}
    </>
  );
}
