package com.vlc;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.ThemedReactContext;

import org.videolan.libvlc.MediaPlayer;

public class VlcEventEmitter {
  static String TAG = "VlcEventEmitter";
  private DeviceEventManagerModule.RCTDeviceEventEmitter emitter;
  private MediaPlayer mediaPlayer;
  private int id;

  public VlcEventEmitter(ThemedReactContext context, MediaPlayer mediaPlayer) {
    this.emitter = context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    this.mediaPlayer = mediaPlayer;
  }

  public void setId(int id) {
    this.id = id;
  }

  private WritableArray getAudioTracks() {
    MediaPlayer.TrackDescription[] tracks = this.mediaPlayer.getAudioTracks();
    WritableArray maps = Arguments.createArray();

    if (tracks == null) {
      return maps;
    }

    for (MediaPlayer.TrackDescription track : tracks) {
      WritableMap map = Arguments.createMap();
      map.putInt("id", track.id);
      map.putString("name", track.name);
      maps.pushMap(map);
    }
    return maps;
  }

  private WritableArray getTextTracks() {
    MediaPlayer.TrackDescription[] tracks = this.mediaPlayer.getSpuTracks();
    WritableArray maps = Arguments.createArray();

    if (tracks == null) {
      return maps;
    }

    for (MediaPlayer.TrackDescription track : tracks) {
      WritableMap map = Arguments.createMap();
      map.putInt("id", track.id);
      map.putString("name", track.name);
      maps.pushMap(map);
    }
    return maps;
  }

  private WritableMap basicEvent() {
    WritableMap map = Arguments.createMap();
    map.putInt("id", this.id);
    map.putDouble("progress", this.mediaPlayer.getTime());
    map.putDouble("duration", this.mediaPlayer.getLength());

    return map;
  }

  public void emitBasicEvent(String name) {
    this.emitter.emit(name, this.basicEvent());
  }

  private String lastVideoInfoSent;
  public void emitVideoInfos() {
    if (this.mediaPlayer.getCurrentVideoTrack() != null) {
      Log.i(TAG, "" + this.mediaPlayer.getCurrentVideoTrack().);
    }
    if (this.mediaPlayer.getAudioTracks() == null) {
      return;
    }
    String mediaUri = this.mediaPlayer.getMedia().getUri().toString();
    if (this.lastVideoInfoSent != null && this.lastVideoInfoSent.equals(mediaUri)) {
      return;
    }
    Log.i(TAG, "Sending video infos for video uri: " + mediaUri);
    this.lastVideoInfoSent = mediaUri;
    WritableMap map = this.basicEvent();
    map.putInt("audioTrack", this.mediaPlayer.getAudioTrack());
    map.putInt("textTrack", this.mediaPlayer.getSpuTrack());
    map.putArray("availableAudioTracks", this.getAudioTracks());
    map.putArray("availableTextTracks", this.getTextTracks());
    this.emitter.emit("onVideoInfos", map);
  }
}
