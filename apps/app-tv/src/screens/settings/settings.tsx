import {noop} from '@media-center/algorithm';
import {SettingsPageQuery} from '@media-center/domains/src/queries/settingsPage.query';
import {ReinitCatalogCommand} from '@media-center/domains/src/catalog/applicative/reinit.command';
import {ScanExistingCommand} from '@media-center/domains/src/fileWatcher/applicative/scanExisting.command';
import {useCallback} from 'react';
import {Section} from '../../components/ui/display/section';
import {Box} from '../../components/ui/display/box';
import {LineButton} from '../../components/ui/input/pressable/lineButton';
import {useLocalUser} from '../../services/localUserProfile';
import {useQuery} from '../../services/hooks/useQuery';
import {Beta} from '../../services/api';
import {handleBasicUserQuery} from '../../components/ui/tools/promptAlert';
import {useMeshContext} from '../../services/contexts/mesh.context';
import {StatusContext} from '../../services/contexts/status.context';

export function Settings() {
  const [{result}] = useQuery(SettingsPageQuery, undefined);
  const {user, resetAccount, resetServer} = useLocalUser();
  const {initStatus} = useMeshContext(StatusContext);

  const rescanLibrary = useCallback(async () => {
    handleBasicUserQuery(Beta.command(new ReinitCatalogCommand()));
  }, []);

  const scanLibrary = useCallback(async () => {
    handleBasicUserQuery(Beta.command(new ScanExistingCommand()));
  }, []);

  return (
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
      </Section>
    </Box>
  );
}
