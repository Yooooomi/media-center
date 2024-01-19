import {Section} from '../../components/section';
import {Box} from '../../components/box';
import {LineButton} from '../../components/ui/pressable/lineButton';
import {noop} from '@media-center/algorithm';
import {useLocalUser} from '../../services/local/localUserProfile';
import {useQuery} from '../../services/useQuery';
import {SettingsPageQuery} from '@media-center/server/src/queries/settingsPage.query';
import {ReinitCatalogCommand} from '@media-center/server/src/domains/catalog/applicative/reinit.command';
import {ScanExistingCommand} from '@media-center/server/src/domains/fileWatcher/applicative/scanExisting.command';
import {useCallback} from 'react';
import {Beta} from '../../services/api';
import {handleBasicUserQuery} from '../../components/ui/promptAlert';

export function Settings() {
  const [{result}] = useQuery(SettingsPageQuery, undefined);
  const {user, resetAccount, resetServer} = useLocalUser();

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
