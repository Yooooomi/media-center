import * as React from 'react';

import { Button, StyleSheet, View } from 'react-native';
import { Vlc } from 'react-native-vlc';

export default function App() {
  const [show, setShow] = React.useState(false);

  return (
    <View style={styles.container}>
      {show && (
        <>
          <Vlc
            onProgress={console.log}
            onVideoInfos={console.log}
            style={styles.box}
            uri="http://10.0.2.2:8080/video/1.mkv"
          />
        </>
      )}
      <Button
        title={show ? 'hide' : 'show'}
        onPress={() => setShow((o) => !o)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 400,
    height: 200,
  },
});
