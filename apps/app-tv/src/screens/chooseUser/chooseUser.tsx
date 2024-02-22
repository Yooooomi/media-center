import {Box} from '../../components/ui/display/box';
import {IconTextButton} from '../../components/ui/input/pressable/iconTextButton';

interface ChooseUserProps {
  declaredUsers: string[];
  chooseUser: (user: string) => void;
}

export function ChooseUser({declaredUsers, chooseUser}: ChooseUserProps) {
  return (
    <Box grow row items="center" content="center" gap="S16">
      {declaredUsers.map((declaredUser, index) => (
        <Box key={declaredUser} h={150} w={150}>
          <IconTextButton
            icon="account"
            iconSize={36}
            text={declaredUser}
            textSize="default"
            focusOnMount={index === 0}
            onPress={() => chooseUser(declaredUser)}
          />
        </Box>
      ))}
    </Box>
  );
}
