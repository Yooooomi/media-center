import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { color, spacing } from "@media-center/ui/src/constants";
import { useNavigate } from "../../screens/params";
import { IconName } from "../ui/display/icon/icon";
import { StatusContext } from "../../services/contexts/status.context";
import { useMeshContext } from "../../services/contexts/mesh.context";
import { SiderButton } from "./siderButton";
import { StatusLine } from "./statusLine";

export function Sider() {
  const { navigate } = useNavigate();

  const buttons = useMemo(() => {
    const options: { title: string; do: () => void; icon: IconName }[] = [
      {
        icon: "home",
        title: "Ajouté récement",
        do: () => navigate("Library", undefined),
      },
      {
        icon: "magnify",
        title: "Rechercher",
        do: () => navigate("Search", undefined),
      },
      {
        icon: "eye",
        title: "Découvrir",
        do: () => navigate("Discover", undefined),
      },
      {
        icon: "movie",
        title: "Vos films",
        do: () => navigate("Movies", undefined),
      },
      {
        icon: "projector",
        title: "Vos séries",
        do: () => navigate("Shows", undefined),
      },
      {
        icon: "cog",
        title: "Paramètres",
        do: () => navigate("Settings", undefined),
      },
    ];
    return options;
  }, [navigate]);

  const { status } = useMeshContext(StatusContext);

  const renderedButtons = useMemo(
    () =>
      buttons.map((button) => (
        <SiderButton
          key={button.title}
          icon={button.icon}
          text={button.title}
          onPress={button.do}
        />
      )),
    [buttons],
  );

  return (
    <View style={styles.root}>
      {renderedButtons}
      <View style={styles.status}>
        <StatusLine extended title="Serveur" status={status?.server ?? false} />
        <StatusLine
          extended
          title="Indexeur"
          status={status?.torrentIndexer ?? false}
        />
        <StatusLine
          extended
          title="Client"
          status={status?.torrentClient ?? false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: "100%",
    padding: spacing.S16,
    backgroundColor: color.darkBackground,
  },
  status: {
    flexGrow: 1,
    justifyContent: "flex-end",
    overflow: "visible",
  },
});
