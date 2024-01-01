import {useState} from 'react';
import Box from '../../components/box';
import TextInput from '../../components/textInput';
import {TextButton} from '../../components/ui/pressable/textButton';

interface ConfigureServerProps {
  onConfigured: (address: string, password: string) => void;
}

export function ConfigureServer({onConfigured}: ConfigureServerProps) {
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Box grow items="center" content="center" gap="S8">
      <TextInput
        type="URL"
        placeholder="Adresse du serveur"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        placeholder="Mot de passe du serveur"
        value={password}
        onChangeText={setPassword}
      />
      <TextButton
        text="Se connecter"
        onPress={() => onConfigured(address, password)}
      />
    </Box>
  );
}
