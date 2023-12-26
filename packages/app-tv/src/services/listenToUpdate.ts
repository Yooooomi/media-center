import * as Updates from 'expo-updates';
import {AppState, Platform} from 'react-native';

async function onFetchUpdateAsync() {
  try {
    await Updates.setExtraParamAsync('expo-runtime-version', '1.0.0');
    await Updates.setExtraParamAsync('expo-channel-name', 'master');
    await Updates.setExtraParamAsync('expo-platform', Platform.OS);

    const update = await Updates.checkForUpdateAsync();

    console.log('update available', update.isAvailable);
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (error) {
    // You can also add an alert() to see the error message in case of an error when fetching updates.
    console.log('Error', error);
  }
}

export function listenToUpdate() {
  AppState.addEventListener('focus', () => {
    onFetchUpdateAsync().catch(console.error);
  });
}
