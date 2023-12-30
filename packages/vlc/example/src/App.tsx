import * as React from 'react';

import { Button, StyleSheet, View } from 'react-native';
import { Vlc } from '@media-center/vlc';

export default function App() {
  const [show, setShow] = React.useState(false);

  return (
    <View style={styles.container}>
      {show && (
        <>
          <Vlc
            volume={100}
            onProgress={(event) => {
              console.log('JS onProgress', JSON.stringify(event, null, ' '));
            }}
            onVideoInfos={(event) => {
              console.log('JS onVideoInfos', JSON.stringify(event, null, ' '));
            }}
            style={styles.box}
            uri="http://192.168.1.153:8080/video/1.mkv"
            arguments={[
              '--sout-mux-caching=200',
              '--file-caching=200',
              '--cdda-caching=200',
              '--http-caching=200',
            ]}
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
