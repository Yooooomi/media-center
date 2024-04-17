import { PortalProvider } from "@gorhom/portal";
import { StyleSheet, View } from "react-native";
import { useMemo } from "react";
import { DEFAULT_HOSTNAME } from "../components/ui/tools/portal/portal";
import { PortalHost } from "../components/ui/tools/portal";
import { AlertProvider } from "../components/ui/tools/alert/alertProvider";
import { LocalUserContextProvider } from "../services/localUserProfile";
import { StatusContextProvider } from "../services/contexts/status.context";
import { Router, Routes } from "./navigation.dependency";

export function Navigation() {
  const routes = useMemo(() => <Routes />, []);

  return (
    <View style={styles.root}>
      <PortalProvider rootHostName={DEFAULT_HOSTNAME} shouldAddRootHost={false}>
        <LocalUserContextProvider>
          <Router>
            <AlertProvider>
              <StatusContextProvider>{routes}</StatusContextProvider>
            </AlertProvider>
            <PortalHost absoluteFill name={DEFAULT_HOSTNAME} />
          </Router>
        </LocalUserContextProvider>
      </PortalProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
  },
});
