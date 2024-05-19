import { KeyboardEventHandler, useCallback, useState } from "react";

import { Box } from "../../ui/display/box";
import { IconButton } from "../../ui/input/pressable/iconButton";
import { Text } from "../../ui/input/text";
import { useNavigate } from "../../../screens/navigation.dependency";
import s from "./index.module.css";

export function Header() {
  const { navigate } = useNavigate();
  const [search, setSearch] = useState("");

  const searchTmdb = useCallback(() => {
    navigate("SearchTmdb", {
      q: search,
    });
  }, [navigate, search]);

  const searchTorrent = useCallback(() => {
    navigate("SearchTorrent", {
      q: search,
    });
  }, [navigate, search]);

  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    (event) => {
      if (event.key !== "Enter") {
        return;
      }
      searchTmdb();
    },
    [searchTmdb],
  );

  return (
    <Box p="S16" bg="darkBackground">
      <Box row w="max-content" items="center">
        <Box ml="S8" mr="S32">
          <Text bold>Pompelup</Text>
        </Box>
        <Box bg="whiteText" r="max" mr="S8">
          <input
            className={s.input}
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Box>
        <IconButton icon="magnify" size={24} onPress={searchTmdb} />
        <IconButton icon="database-search" size={24} onPress={searchTorrent} />
      </Box>
    </Box>
  );
}
