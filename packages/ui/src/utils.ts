import {ViewStyle} from 'react-native'

export function classnameAsStyle(classname: string) {
  return {$$css: true, root: classname} as ViewStyle
}
