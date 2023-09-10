package com.vlc;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

public class VlcViewManager extends SimpleViewManager<VlcView> {
  public static final String REACT_CLASS = "VlcView";
  public static final String TAG = "VlcViewManager";
  public final double id = Math.random();

  @Override
  @NonNull
  public String getName() {
    return REACT_CLASS;
  }

  @Override
  @NonNull
  public VlcView createViewInstance(ThemedReactContext reactContext) {
    Log.i(TAG, "Creating view instance " + id);
    return new VlcView(reactContext);
  }

  @Override
  public void onDropViewInstance(@NonNull VlcView view) {
    super.onDropViewInstance(view);
    view.clear();
  }

  @ReactProp(name = "autoplay", defaultBoolean = true)
  public void setAutoplay(final VlcView view, final boolean autoplay) {
    view.setAutoplay(autoplay);
  }

  @ReactProp(name = "play")
  public void setPlay(final VlcView view, final boolean playing) {
    view.setPlay(playing);
  }

  @ReactProp(name = "uri")
  public void setUri(final VlcView view, final String uri) {
    view.setUri(uri);
  }

  @ReactProp(name = "seek")
  public void setSeek(final VlcView view, final int position) {
    view.seek(position);
  }

  @ReactProp(name = "volume")
  public void setVolume(final VlcView view, final int volume) {
    view.setVolume(volume);
  }

  @ReactProp(name = "audioTrack")
  public void setAudioTrack(final VlcView view, final int audioTrackId) {
    view.setAudioTrack(audioTrackId);
  }

  @ReactProp(name = "textTrack")
  public void setTextTrack(final VlcView view, final int textTrackId) {
    view.setTextTrack(textTrackId);
  }
}
