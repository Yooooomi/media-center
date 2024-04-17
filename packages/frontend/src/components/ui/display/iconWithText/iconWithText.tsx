import { IconName, IconProps } from "../icon/icon.props";
import { Icon } from "../icon/icon";
import { Text, TextProps } from "../../input/text";

interface IconWithTextProps {
  name: IconName;
  text: string;
  textProps?: Partial<TextProps>;
  iconProps?: Partial<IconProps>;
}

export function IconWithText({
  name,
  text,
  textProps,
  iconProps,
}: IconWithTextProps) {
  return (
    <>
      <Icon size={18} name={name} {...iconProps} />
      <Text {...textProps}> {text}</Text>
    </>
  );
}
