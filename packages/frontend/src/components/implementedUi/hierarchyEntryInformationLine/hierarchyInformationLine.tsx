import { View } from "react-native";
import { HierarchyEntryInformation } from "@media-center/domains/src/hierarchyEntryInformation/domain/hierarchyEntryInformation";
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
  return (
    <View>
      <Text>
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
            <Text>
              <IconWithText
                name={hierarchyEntryInformation ? "check" : "close"}
                text="Sous-titres"
              />
            </Text>
          </Tooltip>
        ) : null}
        {hierarchyEntryInformation ? (
          <Text>
            {" "}
            ・ {hierarchyEntryInformation.videoTrack.resolution.toDisplay()}
            {hierarchyEntryInformation.videoTrack.type ? (
              <Text> ・ {hierarchyEntryInformation.videoTrack.type}</Text>
            ) : null}
          </Text>
        ) : null}
      </Text>
    </View>
  );
}
