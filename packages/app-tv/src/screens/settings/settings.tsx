import {Section} from '../../components/section';
import {Box} from '../../components/box';
import {LineButton} from '../../components/ui/pressable/lineButton';
import {noop} from '@media-center/algorithm';
import {useCallback, useContext} from 'react';
import {LocalUserContext} from '../../services/local/localUserProfile';
import {useQuery} from '../../services/useQuery';
import {SettingsPageQuery} from '@media-center/server/src/queries/settingsPage.query';

export function Settings() {
  const {user, save} = useContext(LocalUserContext);

  const [{result}] = useQuery(SettingsPageQuery, undefined);

  const resetAccount = useCallback(() => {
    user.call('setUser', undefined);
    save();
  }, [save, user]);

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
          text="Rescanner la librairie (peut prendre longtemps)"
          variant="delete"
          onPress={noop}
        />
      </Section>
    </Box>
  );
}
