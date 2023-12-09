import {StyleSheet} from 'react-native';
import {card, spacing} from '../../../../services/constants';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {useImageUri} from '../../../../services/tmdb';
import {useNavigate} from '../../../../screens/params';
import Box from '../../../box';
import Text from '../../../text/text';
import React from 'react';
import {VerticalCard} from '../../../ui/cards/verticalCard';

interface ShowCardProps {
  show: Show;
  focusOnMount?: boolean;
}

export const ShowCardSize = {
  width: card.width,
  height: card.height + 24,
};

export function ShowCard({show, focusOnMount}: ShowCardProps) {
  const imageUri = useImageUri(show.poster_path ?? show.backdrop_path);
  const navigate = useNavigate();

  return (
    <Box>
      <VerticalCard
        focusOnMount={focusOnMount}
        uri={imageUri}
        onPress={() => navigate('Show', {show})}
      />
      <Box items="flex-start" style={styles.title} bg="background">
        <Text size="small" align="left" numberOfLines={1} style={styles.text}>
          {show.title}
        </Text>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
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
