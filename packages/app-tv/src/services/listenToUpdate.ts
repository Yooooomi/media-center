import * as Updates from 'expo-updates';
import {useEffect} from 'react';
import {Alert, AppState, Platform} from 'react-native';
import {UpdateStore} from './local/updateContext';

let ignoreNext = false;

async function onFetchUpdateAsync() {
  try {
    await Updates.setExtraParamAsync('expo-runtime-version', '1.0.0');
    await Updates.setExtraParamAsync('expo-channel-name', 'master');
    await Updates.setExtraParamAsync('expo-platform', Platform.OS);

    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      const userUpdate = await UpdateStore.load();
      userUpdate.setUpdated();
      await UpdateStore.save(userUpdate);
      await Updates.reloadAsync();
    }
  } catch (error) {
    if (!__DEV__) {
      console.log('Update error', error);
      ignoreNext = true;
      Alert.alert(
        'Erreur',
        'Erreur lors de la mise a jour, certaines fonctionnalités peuvent ne pas fonctionner',
      );
    }
  }
}

export function useListenToUpdate() {
  useEffect(() => {
    async function setupUpdates() {
      const userUpdate = await UpdateStore.load();
      if (userUpdate.updated) {
        Alert.alert('Mise à jour', "L'application vient d'être mise à jour");
        userUpdate.announcedUpdated();
        await UpdateStore.save(userUpdate);
      }
      onFetchUpdateAsync().catch(console.error);
    }
    setupUpdates().catch(console.log);
    const subscription = AppState.addEventListener('focus', state => {
      console.log('State', state);
      if (ignoreNext) {
        ignoreNext = false;
        return;
      }
      onFetchUpdateAsync().catch(console.error);
    });
    return subscription.remove;
  }, []);
}
