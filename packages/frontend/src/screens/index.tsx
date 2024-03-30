import { PortalProvider } from "@gorhom/portal";
import { StyleSheet, View } from "react-native";
import { useMemo } from "react";
import { DEFAULT_HOSTNAME } from "../components/ui/tools/portal/portal";
import { PortalHost } from "../components/ui/tools/portal";
import { AlertProvider } from "../components/ui/tools/alert/alertProvider";
import { LocalUserContextProvider } from "../services/localUserProfile";
import { StatusContextProvider } from "../services/contexts/status.context";
import { InjectableContext } from "../services/di/injectableContext";
import { NavigationContext, useNavigationContext } from "./params";
import { Routes, Router } from "./navigation";

export function Navigation() {
  const { value, currentRoute } = useNavigationContext();

  const routes = useMemo(
    () => <Routes location={currentRoute} />,
    [currentRoute],
  );

  return (
    <View style={styles.root}>
      <PortalProvider rootHostName={DEFAULT_HOSTNAME} shouldAddRootHost={false}>
        <Router>
          <AlertProvider>
            <InjectableContext
              provider={NavigationContext.Provider}
              value={value}
            >
              <LocalUserContextProvider>
                <StatusContextProvider>{routes}</StatusContextProvider>
              </LocalUserContextProvider>
            </InjectableContext>
          </AlertProvider>
        </Router>
        <PortalHost style={styles.portalHost} name={DEFAULT_HOSTNAME} />
      </PortalProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
  },
  portalHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
});
