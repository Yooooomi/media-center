import {ShowSeason} from '@media-center/domains/src/tmdb/domain/showSeason';
import {Box} from '../../components/ui/display/box';
import {TabButton} from '../../components/ui/input/pressable/tabButton';

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
    <Box row gap="S8">
      {seasons.map(s => (
        <TabButton
          key={s.season_number}
          selected={season === s.season_number}
          text={`Saison ${s.season_number}`}
          onPress={() => onSeasonChange(s.season_number)}
        />
      ))}
    </Box>
  );
}
