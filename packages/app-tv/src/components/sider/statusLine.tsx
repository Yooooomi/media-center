import {Box} from '../ui/display/box';
import {Dot} from '../ui/display/dot';
import {Text} from '../ui/input/text';

interface StatusLineProps {
  title: string;
  status: boolean;
  extended: boolean;
}

export function StatusLine({title, status, extended}: StatusLineProps) {
  return (
    <Box row ml="S16" mb="S16" gap="S8" items="center">
      <Dot color={status ? 'statusOK' : 'statusKO'} />
      {extended && <Text size="small">{title}</Text>}
    </Box>
  );
}
