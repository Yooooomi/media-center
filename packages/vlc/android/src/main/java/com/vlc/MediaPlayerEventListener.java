package com.vlc;

import android.util.Log;

import org.videolan.libvlc.MediaPlayer;

public class MediaPlayerEventListener implements MediaPlayer.EventListener {
  static String TAG = "MediaPlayerEventListener";
  private VlcEventEmitter emitter;

  public MediaPlayerEventListener(VlcEventEmitter emitter) {
    this.emitter = emitter;
  }

  @Override
  public void onEvent(MediaPlayer.Event event) {
    switch (event.type) {
      case MediaPlayer.Event.PositionChanged:
        this.emitter.emitBasicEvent("onProgress");
        break;
      case MediaPlayer.Event.Buffering:
        this.emitter.emitVideoInfos();
        break;
      case MediaPlayer.Event.EncounteredError:
        this.emitter.emitBasicEvent("onError");
        break;
      case MediaPlayer.Event.EndReached:
        this.emitter.emitBasicEvent("onEnd");
        break;
    }
  }
}
