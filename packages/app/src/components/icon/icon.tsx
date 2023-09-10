import MaterialCommunityIconsGlyphs from 'react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import {color} from '../../services/constants';
import React from 'react';

export type IconName = keyof typeof MaterialCommunityIconsGlyphs;

interface IconProps {
  name: IconName;
  size?: number;
}

const Icon = React.forwardRef<Icons, IconProps>(({name, size}, ref) => {
  return <Icons ref={ref} name={name} size={size} color={color.white} />;
});

export default Icon;
