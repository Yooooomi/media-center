import { ReactNode } from "react";
import { color as uicolor } from "@media-center/ui/src/constants";
import { Icon } from "../icon";
import { Box } from "../box";

interface StarsProps {
  note: number;
  outOf: number;
  color?: keyof typeof uicolor;
  size?: number;
}

export function Stars({ note, outOf, color, size }: StarsProps) {
  const stars: ReactNode[] = [];
  const flatNote = Math.floor(note);

  for (let i = 0; i < flatNote; i += 1) {
    stars.push(<Icon key={i} name="star" color={color} size={size} />);
  }
  if (note - flatNote > 0.5) {
    stars.push(
      <Icon key="half" name="star-half-full" color={color} size={size} />,
    );
  } else {
    stars.push(
      <Icon key={`empty-0`} name="star-outline" color={color} size={size} />,
    );
  }
  for (let i = 0; i < outOf - Math.ceil(note); i += 1) {
    stars.push(
      <Icon key={`empty-${i}`} name="star-outline" color={color} size={size} />,
    );
  }

  return (
    <Box row gap="S0">
      {stars}
    </Box>
  );
}
