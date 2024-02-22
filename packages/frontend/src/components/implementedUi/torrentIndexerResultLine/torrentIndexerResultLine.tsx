import { TorrentIndexerResult } from "@media-center/domains/src/torrentIndexer/domain/torrentIndexerResult";
import { StyleSheet } from "react-native";
import { Box } from "../../ui/display/box";
import { Text } from "../../ui/input/text/text";
import { Pressable } from "../../ui/input/pressable/pressable";

interface TorrentIndexerResultLineProps {
  torrentIndexerResult: TorrentIndexerResult;
  onPress: () => void;
  focusOnMount?: boolean;
}

export function TorrentIndexerResultLine({
  torrentIndexerResult,
  onPress,
  focusOnMount,
}: TorrentIndexerResultLineProps) {
  return (
    <Pressable onPress={onPress} focusOnMount={focusOnMount}>
      {({ focused }) => (
        <Box
          p="S8"
          r="default"
          bg={focused ? "buttonBackgroundFocused" : "buttonBackground"}
        >
          <Text color={focused ? "buttonTextFocused" : "buttonText"}>
            {torrentIndexerResult.name}
          </Text>
          <Box row content="space-between">
            <Text
              color={focused ? "buttonTextFocused" : "buttonText"}
              style={styles.left}
            >
              {torrentIndexerResult.toDisplaySize()}
            </Text>
            <Text color="ctaGreen" style={styles.mid}>
              {torrentIndexerResult.seeders.toString()}
            </Text>
            <Text color="error" style={styles.right}>
              {torrentIndexerResult.leechers.toString()}
            </Text>
          </Box>
        </Box>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  left: {
    flex: 1,
  },
  mid: {
    flex: 1,
    textAlign: "center",
  },
  right: {
    flex: 1,
    textAlign: "right",
  },
});
