import {Image, ImageProps} from 'react-native';

interface LoggedImageProps extends Omit<ImageProps, 'source'> {
  uri: string | undefined;
}

export default function LoggedImage({uri, ...other}: LoggedImageProps) {
  return (
    <Image
      {...other}
      onError={console.error}
      source={{
        uri,
      }}
    />
  );
}
