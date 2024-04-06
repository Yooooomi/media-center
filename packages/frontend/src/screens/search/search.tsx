import { spacing } from "@media-center/ui/src/constants";
import { Box } from "../../components/ui/display/box";
import { IconTextButton } from "../../components/ui/input/pressable/iconTextButton";
import { screen } from "../../services/cards";
import { useNavigate } from "../navigation.dependency";

export function Search() {
  const { navigate } = useNavigate();

  const size = screen.width / 2 - spacing.S16 * 2;

  return (
    <Box grow row items="center" content="center" gap="S8" ph="S16">
      <Box w={size} h={size} maxw={200} maxh={200}>
        <IconTextButton
          focusOnMount
          text="Rechercher"
          textSize="default"
          icon="search-web"
          iconSize={48}
          onPress={() => navigate("SearchTmdb", undefined)}
        />
      </Box>
      <Box w={size} h={size} maxw={200} maxh={200}>
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
