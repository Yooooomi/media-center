import {Text, TextProps} from '../text';

interface TmdbNoteProps extends Omit<TextProps, 'children'> {
  note: number;
}

export function TmdbNote({note, ...other}: TmdbNoteProps) {
  return <Text {...other}>🍿 {note}%</Text>;
}
