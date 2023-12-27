import {FC, ReactNode} from 'react';
import Box from '../components/box/box';
import {Sider} from '../components/sider/sider';
import {StyleSheet, TVFocusGuideView} from 'react-native';

export function withSider<C extends (args: any) => ReactNode>(
  Component: C,
): FC {
  return (a: Parameters<C>['0']) => (
    <Box row>
      <Box h="100%">
        <Sider />
      </Box>
      <TVFocusGuideView
        style={styles.content}
        trapFocusDown
        trapFocusUp
        autoFocus>
        <Component {...a} />
      </TVFocusGuideView>
    </Box>
  );
}

const styles = StyleSheet.create({
  content: {
    flexBasis: 0,
    flexGrow: 1,
  },
});
