import {StyleSheet, View} from 'react-native';
import {card, cardShadow, radius, spacing} from '../../services/constants';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import LoggedImage from '../loggedImage/loggedImage';
import {useImageUri} from '../../services/tmdb';
import Pressable, {PressableProps} from '../pressable/pressable';
import {useNavigate} from '../../screens/params';
import Box from '../box';
import Text from '../text/text';
import React from 'react';

interface ShowCardProps extends Omit<PressableProps, 'children'> {
  show: Show;
}

export const ShowCardSize = {
  width: card.width,
  height: card.height + 24,
};

const ShowCard = React.forwardRef<View, ShowCardProps>(
  ({show, ...other}, ref) => {
    const imageUri = useImageUri(show.poster_path ?? show.backdrop_path);
    const navigate = useNavigate();

    return (
      <Box>
        <Pressable
          ref={ref}
          style={({focused}) => [
            styles.root,
            {zIndex: focused ? 1 : undefined},
          ]}
          onPress={() => navigate('Show', {show})}
          {...other}>
          <LoggedImage uri={imageUri} style={styles.image} resizeMode="cover" />
        </Pressable>
        <Box items="flex-start" style={styles.title} bg="background">
          <Text size="small" align="left" numberOfLines={1} style={styles.text}>
            {show.title}
          </Text>
        </Box>
      </Box>
    );
  },
);

export default ShowCard;

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.default,
    overflow: 'hidden',
    height: card.height,
    width: card.width,
    ...cardShadow,
  },
  image: {
    height: card.height,
    width: card.width,
  },
  title: {
    overflow: 'hidden',
    width: card.width,
    height: 24,
    zIndex: -1,
  },
  text: {
    marginTop: spacing.S4,
    marginLeft: spacing.S4,
  },
});
