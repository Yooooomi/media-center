import { noop } from "@media-center/algorithm";
import { SettingsPageQuery } from "@media-center/domains/src/queries/settingsPage.query";
import { ReinitCatalogCommand } from "@media-center/domains/src/catalog/applicative/reinit.command";
import { RescanSubtitlesCommand } from "@media-center/domains/src/hierarchyEntryInformation/applicative/rescanSubtitles.command";
import { ScanExistingCommand } from "@media-center/domains/src/fileWatcher/applicative/scanExisting.command";
import { useCallback, useEffect, useState } from "react";
import { Job } from "@media-center/domain-driven/src/bus/jobRegistry";
import { ScrollView } from "react-native";
import { Section } from "../../components/ui/display/section";
import { Box } from "../../components/ui/display/box";
import { LineButton } from "../../components/ui/input/pressable/lineButton";
import { useLocalUser } from "../../services/localUserProfile";
import { handleBasicUserQuery } from "../../components/ui/tools/promptAlert";
import { useMeshContext } from "../../services/contexts/mesh.context";
import { StatusContext } from "../../services/contexts/status.context";
import { useQuery } from "../../services/api/useQuery";
import { Beta } from "../../services/api/api";
import { Text } from "../../components/ui/input/text";
import { Icon } from "../../components/ui/display/icon";

export function Settings() {
  const [{ result }] = useQuery(SettingsPageQuery, undefined);
  const { user, resetAccount, resetServer } = useLocalUser();
  const { initStatus } = useMeshContext(StatusContext);
  const [busState, setBusState] = useState<ReturnType<Job["serialize"]>[]>([]);

  const rescanLibrary = useCallback(
    () => handleBasicUserQuery(Beta.command(new ReinitCatalogCommand())),
    [],
  );

  const scanLibrary = useCallback(
    () => handleBasicUserQuery(Beta.command(new ScanExistingCommand())),
    [],
  );

  const rescanSubtitles = useCallback(
    () => handleBasicUserQuery(Beta.command(new RescanSubtitlesCommand())),
    [],
  );

  useEffect(() => {
    Beta.rawReactiveQuery(new URL(Beta.getUrl("/meta/bus")), (rawResult) => {
      setBusState(JSON.parse(rawResult));
    });
  }, []);

  return (
    <ScrollView>
      <Box p="S16">
        <Section title="Paramètres">
          <LineButton
            focusOnMount
            text={`Adresse du server: ${user.instance?.serverAddress}`}
            onPress={noop}
          />
          <LineButton
            text={`Nombre de fichiers pris en compte: ${result?.hierarchyItems}`}
            onPress={noop}
          />
          <LineButton
            text={`Nombre de d'entrées dans le catalogue: ${result?.catalogEntries}`}
            onPress={noop}
          />
          <LineButton text="Rafraichir le statut" onPress={initStatus} />
          <LineButton
            text={`Changer de compte: ${user.instance?.user}`}
            onPress={resetAccount}
          />
          <LineButton
            text={`Changer de serveur: ${user.instance?.serverAddress}`}
            onPress={resetServer}
            variant="delete"
          />
          <LineButton
            text="Scanner la librairie (s'il manque un fichier)"
            variant="delete"
            onPress={scanLibrary}
          />
          <LineButton
            text="Re-scanner la librairie (peut prendre longtemps)"
            variant="delete"
            onPress={rescanLibrary}
          />
          <LineButton
            text="Re-scanner les sous-titres (peut prendre très longtemps)"
            variant="delete"
            onPress={rescanSubtitles}
          />
        </Section>
        <Section title="Bus">
          {busState.map((job) => (
            <Box key={job.data} row items="center" content="flex-start">
              <Icon name="lightning-bolt" size={18} />
              <Text>
                [{job.namespace}] {job.name}: {job.data}
              </Text>
            </Box>
          ))}
        </Section>
      </Box>
    </ScrollView>
  );
}
