import {useImageUri} from '../../services/tmdb';
import {useNavigate} from '../../screens/params';
import {ShowEpisode} from '@media-center/server/src/domains/tmdb/domain/showEpisode';
import {HierarchyItem} from '@media-center/server/src/domains/fileWatcher/domain/hierarchyItem';
import InfoCard, {ExtraInfoCardProps} from '../infoCard/infoCard';

interface ShowEpisodeCardProps extends ExtraInfoCardProps {
  showEpisode: ShowEpisode;
  hierarchyItems: HierarchyItem[];
}

export default function ShowEpisodeCard({
  showEpisode,
  hierarchyItems,
  ...other
}: ShowEpisodeCardProps) {
  const imageUri = useImageUri(showEpisode.still_path);
  const navigate = useNavigate();

  return (
    <InfoCard
      {...other}
      pillText={`Episode ${showEpisode.episode_number}`}
      title={showEpisode.name}
      subtitle={`${showEpisode.runtime} minutes`}
      onPress={() =>
        hierarchyItems[0] &&
        navigate('Watch', {hierarchyItem: hierarchyItems[0]})
      }
      imageUri={imageUri}
    />
  );
}
