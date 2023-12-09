import {ShowSeason} from '@media-center/server/src/domains/tmdb/domain/showSeason';
import {useImageUri} from '../../../../services/tmdb';
import {useNavigate} from '../../../../screens/params';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {ShowCatalogEntryFulfilled} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import InfoCard from '../../../infoCard/infoCard';

interface SeasonCardProps {
  show: Show;
  season: ShowSeason;
  catalogEntry: ShowCatalogEntryFulfilled;
  focusOnMount?: boolean;
}

export default function ShowSeasonCard({
  show,
  season,
  catalogEntry,
  focusOnMount,
}: SeasonCardProps) {
  const imageUri = useImageUri(season.poster_path);
  const navigate = useNavigate();

  return (
    <InfoCard
      focusOnMount={focusOnMount}
      onPress={() => navigate('ShowSeason', {show, season, catalogEntry})}
      pillText={season.air_date}
      title={`Saison ${season.season_number}`}
      subtitle={`${season.episode_count} épisodes`}
      imageUri={imageUri}
    />
  );
}
