import { View } from "react-native";
import { HierarchyEntryInformation } from "@media-center/domains/src/hierarchyEntryInformation/domain/hierarchyEntryInformation";
import { fontSize } from "@media-center/ui/src/constants";
import { isNative } from "../../../services/platform";
import { IconWithText } from "../../ui/display/iconWithText";
import { Text } from "../../ui/input/text";
import { Tooltip } from "../../ui/display/tooltip";
import { Box } from "../../ui/display/box";

interface HierarchyEntryInformationLineProps {
  hierarchyEntryInformation: HierarchyEntryInformation | undefined;
}

export function HierarchyEntryInformationLine({
  hierarchyEntryInformation,
}: HierarchyEntryInformationLineProps) {
  const subtitles = (
    <IconWithText
      name={hierarchyEntryInformation ? "check" : "close"}
      text="Sous-titres"
      textProps={{ size: "small" }}
      iconProps={{ size: fontSize.small }}
    />
  );

  return (
    <View>
      <Text size="small">
        {!isNative() ? (
          <Tooltip
            tooltip={
              <Box bg="whiteText" shrink={false} p="S8" gap="S4" r="default">
                {hierarchyEntryInformation?.textTracks.map((e) => (
                  <Text key={e.index} color="darkText">
                    {e.name}
                  </Text>
                ))}
              </Box>
            }
          >
            {subtitles}
          </Tooltip>
        ) : (
          subtitles
        )}
        {hierarchyEntryInformation ? (
          <Text size="small">
            {" "}
            ・ {hierarchyEntryInformation.videoTrack.resolution.toDisplay()}
            {hierarchyEntryInformation.videoTrack.type ? (
              <Text size="small">
                {" "}
                ・ {hierarchyEntryInformation.videoTrack.type}
              </Text>
            ) : null}
          </Text>
        ) : null}
      </Text>
    </View>
  );
}
