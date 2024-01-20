import {FC, ReactNode} from 'react';
import {StyleSheet, TVFocusGuideView} from 'react-native';
import {Box} from '../../components/ui/display/box/box';
import {Sider} from '../../components/sider/sider';

export function withSider<C extends (args: any) => ReactNode>(
  Component: C,
): FC {
  return (a: Parameters<C>['0']) => (
    <Box row grow>
      <Box h="100%">
        <Sider />
      </Box>
      <TVFocusGuideView
        style={styles.content}
        trapFocusDown
        trapFocusUp
        autoFocus>
        <Box grow>
          <Component {...a} />
        </Box>
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
