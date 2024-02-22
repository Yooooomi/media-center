import { useState } from "react";
import { StyleSheet } from "react-native";
import { Box } from "../../components/ui/display/box";
import { TextButton } from "../../components/ui/input/pressable/textButton";
import { TextInput } from "../../components/ui/input/textInput/textInput";

interface ConfigureServerProps {
  onConfigured: (address: string, password: string) => void;
}

export function ConfigureServer({ onConfigured }: ConfigureServerProps) {
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Box grow items="center" content="center" gap="S8">
      <TextInput
        defaultValue="http"
        keyboardType="url"
        placeholder="Adresse HTTP du serveur"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />
      <TextInput
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        placeholder="Mot de passe du serveur"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Box w={300} items="center">
        <TextButton
          text="Se connecter"
          onPress={() => onConfigured(address, password)}
        />
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  input: {
    width: 300,
  },
});
