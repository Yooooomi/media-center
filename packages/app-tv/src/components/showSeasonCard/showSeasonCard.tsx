import {ShowSeason} from '@media-center/server/src/domains/tmdb/domain/showSeason';
import {useImageUri} from '../../services/tmdb';
import {useNavigate} from '../../screens/params';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {ShowCatalogEntryFulfilled} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import InfoCard, {ExtraInfoCardProps} from '../infoCard/infoCard';

interface SeasonCardProps extends ExtraInfoCardProps {
  show: Show;
  season: ShowSeason;
  catalogEntry: ShowCatalogEntryFulfilled;
}

export default function ShowSeasonCard({
  show,
  season,
  catalogEntry,
  ...other
}: SeasonCardProps) {
  const imageUri = useImageUri(season.poster_path);
  const navigate = useNavigate();

  return (
    <InfoCard
      onPress={() => navigate('ShowSeason', {show, season, catalogEntry})}
      pillText={season.air_date}
      title={`Saison ${season.season_number}`}
      subtitle={`${season.episode_count} épisodes`}
      imageUri={imageUri}
      {...other}
    />
  );
}
