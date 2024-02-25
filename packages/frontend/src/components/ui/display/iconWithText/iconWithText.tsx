import { Box } from "../box";
import { IconName } from "../icon/icon.props";
import { Icon } from "../icon/icon";
import { Text } from "../../input/text";

interface IconWithTextProps {
  name: IconName;
  text: string;
}

export function IconWithText({ name, text }: IconWithTextProps) {
  return (
    <Box row gap="S8" items="center">
      <Icon size={18} name={name} />
      <Text>{text}</Text>
    </Box>
  );
}
