import { View } from "react-native";
import { HierarchyEntryInformation } from "@media-center/domains/src/hierarchyEntryInformation/domain/hierarchyEntryInformation";
import { isNative } from "../../../services/platform";
import { IconWithText } from "../../ui/display/iconWithText";
import { Text } from "../../ui/input/text";

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
          <Text>
            <IconWithText
              name={hierarchyEntryInformation ? "check" : "close"}
              text="Sous-titres"
            />
          </Text>
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
