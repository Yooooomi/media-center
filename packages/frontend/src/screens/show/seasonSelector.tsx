import { ShowSeason } from "@media-center/domains/src/tmdb/domain/showSeason";
import { View } from "react-native";
import { color, radius, spacing } from "@media-center/ui/src/constants";
import { Box } from "../../components/ui/display/box";
import { TabButton } from "../../components/ui/input/pressable/tabButton";

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
    <View
      style={{
        flexDirection: "row",
        backgroundColor: color.darkBackground,
        borderRadius: radius.default,
        padding: 6,
        flexShrink: 1,
        width: "max-content",
        gap: spacing.S4,
      }}
    >
      {seasons.map((s) => (
        <TabButton
          key={s.season_number}
          selected={season === s.season_number}
          text={`Saison ${s.season_number}`}
          onPress={() => onSeasonChange(s.season_number)}
        />
      ))}
    </View>
  );
}
