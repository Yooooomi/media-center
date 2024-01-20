import {ActivityIndicator, Image, ImageProps, ViewStyle} from 'react-native';
import {Box} from '../box';

interface RateLimitedImageProps extends Omit<ImageProps, 'source'> {
  uri: string | undefined;
}

export function RateLimitedImage({
  uri,
  style,
  ...other
}: RateLimitedImageProps) {
  return uri ? (
    <Image style={style} {...other} source={{uri}} />
  ) : (
    <Box style={style as ViewStyle} content="center" items="center">
      <ActivityIndicator />
    </Box>
  );
}
