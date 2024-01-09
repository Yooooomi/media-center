import {useState} from 'react';
import {Box} from '../../components/box';
import {TextButton} from '../../components/ui/pressable/textButton';
import {TextInput} from '../../components/ui/textInput';

interface ConfigureServerProps {
  onConfigured: (address: string, password: string) => void;
}

export function ConfigureServer({onConfigured}: ConfigureServerProps) {
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Box grow items="center" content="center" gap="S8">
      <TextInput
        keyboardType="url"
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
