import { Alert } from "react-native";
import { ignoreNextForeground } from "../../../services/listenToUpdate";

export function PromptAlert(...args: Parameters<typeof Alert.alert>) {
  ignoreNextForeground();
  Alert.alert(...args);
}

export function PromptError(error: Error | unknown) {
  PromptAlert("Erreur", beautifyError(error));
}

export function beautifyError(error: Error | unknown) {
  return `Une erreur est survenue: ${
    error instanceof Error ? error.message : "unknown"
  }`;
}

export function handleBasicUserQuery(promise: Promise<void>) {
  promise.catch((e) => {
    PromptError(e);
  });
}
