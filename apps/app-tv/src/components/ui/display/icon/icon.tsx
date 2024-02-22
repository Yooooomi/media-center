import MaterialCommunityIconsGlyphs from 'react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import React, {ComponentProps} from 'react';
import Animated from 'react-native-reanimated';
import {color as colors} from '../../../../services/constants';

export type IconName = keyof typeof MaterialCommunityIconsGlyphs;

interface IconProps {
  name: IconName;
  color?: keyof typeof colors;
  size?: number;
  style?: ComponentProps<typeof Icons>['style'];
}

export const Icon = React.forwardRef<Icons, IconProps>(
  ({name, size, color, style}, ref) => {
    return (
      <Icons
        style={style}
        ref={ref}
        name={name}
        size={size}
        color={colors[color ?? 'whiteText']}
      />
    );
  },
);

export const AnimatedIcon = Animated.createAnimatedComponent(Icon);
