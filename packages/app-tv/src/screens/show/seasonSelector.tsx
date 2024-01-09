import {ShowSeason} from '@media-center/server/src/domains/tmdb/domain/showSeason';
import {TextButton} from '../../components/ui/pressable/textButton';
import {Box} from '../../components/box';

interface SeasonSelectorProps {
  seasons: ShowSeason[];
  season: number;
  onSeasonChange: (seasonNumber: number) => void;
}

export function SeasonSelector({
  seasons,
  season,
  onSeasonChange,
}: SeasonSelectorProps) {
  return (
    <Box row shrink gap="S8">
      {seasons.map(s => (
        <TextButton
          key={s.season_number}
          variant={season === s.season_number ? 'selected' : 'default'}
          text={`Saison ${s.season_number}`}
          onPress={() => onSeasonChange(s.season_number)}
        />
      ))}
    </Box>
  );
}
