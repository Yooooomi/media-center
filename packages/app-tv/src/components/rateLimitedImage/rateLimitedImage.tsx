import {ActivityIndicator, Image, ImageProps, ViewStyle} from 'react-native';
import {PromiseQueue} from '@media-center/server/src/tools/queue';
import {useEffect, useState} from 'react';
import Box from '../box';

interface RateLimitedImageProps extends Omit<ImageProps, 'source'> {
  uri: string | undefined;
}

// TMDB images has a 50 requests/second rate limit
// we take 40 to be sure
const rateLimitQueue = new PromiseQueue(1000 / 40);

export function RateLimitedImage({
  uri,
  style,
  ...other
}: RateLimitedImageProps) {
  const [readyUri, setReadyUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function init() {
      await rateLimitQueue.queue(Promise.resolve);
      setReadyUri(uri);
    }
    if (!uri) {
      return;
    }
    init().catch(console.error);
  }, [uri]);

  return readyUri ? (
    <Image style={style} {...other} source={{uri: readyUri}} />
  ) : (
    <Box style={style as ViewStyle} content="center" items="center">
      <ActivityIndicator />
    </Box>
  );
}
