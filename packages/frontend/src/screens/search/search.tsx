import { Box } from "../../components/ui/display/box";
import { IconTextButton } from "../../components/ui/input/pressable/iconTextButton";
import { useNavigate } from "../navigation";

export function Search() {
  const { navigate } = useNavigate();

  return (
    <Box grow row items="center" content="center" gap="S8">
      <Box w={200} h={200}>
        <IconTextButton
          focusOnMount
          text="Rechercher"
          textSize="default"
          icon="search-web"
          iconSize={48}
          onPress={() => navigate("SearchTmdb", undefined)}
        />
      </Box>
      <Box w={200} h={200}>
        <IconTextButton
          text="Rechercher un torrent"
          textSize="default"
          icon="database-search-outline"
          iconSize={48}
          onPress={() => navigate("SearchTorrent", undefined)}
        />
      </Box>
    </Box>
  );
}
