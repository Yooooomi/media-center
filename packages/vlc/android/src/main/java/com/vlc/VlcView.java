package com.vlc;

import org.videolan.libvlc.LibVLC;
import org.videolan.libvlc.Media;
import org.videolan.libvlc.MediaPlayer;
import org.videolan.libvlc.interfaces.IVLCVout;

import android.graphics.SurfaceTexture;
import android.media.AudioManager;
import android.net.Uri;
import android.util.Log;
import android.view.View;
import android.view.TextureView;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.uimanager.ThemedReactContext;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class VlcView extends TextureView implements TextureView.SurfaceTextureListener, View.OnLayoutChangeListener, IVLCVout.OnNewVideoLayoutListener, IVLCVout.Callback, AudioManager.OnAudioFocusChangeListener {
  private static String TAG = "VlcView";
  private SurfaceTexture currentSurface;
  private LibVLC vlc;
  private MediaPlayer mediaPlayer;
  private Integer id;
  private LifecycleListener lifecycleListener;

  // PROPS
  private String uri;
  private VlcEventEmitter emitter;
  private boolean autoplay = true;
  private ArrayList<String> arguments = new ArrayList<>();
  private boolean hwDecode = false;
  private boolean forceHwDecode = false;

  public VlcView(@NonNull ThemedReactContext context) {
    super(context);
    this.setSurfaceTextureListener(this);
    this.addOnLayoutChangeListener(this);
    this.lifecycleListener = new LifecycleListener(context);
  }

  @Override
  public void setId(final int id) {
    super.setId(id);
    this.id = id;
  }

  public void setAutoplay(boolean autoplay) {
    this.autoplay = autoplay;
    if (this.uri != null && this.mediaPlayer != null) {
      this.mediaPlayer.play();
    }
  }

  public void setArguments(ArrayList<String> arguments) {
    this.arguments = arguments;
  }

  public void setPlay(boolean playing) {
    if (this.mediaPlayer == null) {
      return;
    }
    if (playing) {
      this.mediaPlayer.play();
    } else {
      this.mediaPlayer.pause();
    }
  }

  public void seek(final int position) {
    if (this.mediaPlayer == null) {
      return;
    }
    this.mediaPlayer.setTime(position);
  }

  public void setVolume(final int volume) {
    if (this.mediaPlayer == null) {
      return;
    }
    this.mediaPlayer.setVolume(volume);
  }

  public void setAudioTrack(final int index) {
    if (this.mediaPlayer == null) {
      return;
    }
    this.mediaPlayer.setAudioTrack(index);
  }

  public void setTextTrack(final int index) {
    if (this.mediaPlayer == null) {
      return;
    }
    this.mediaPlayer.setSpuTrack(index);
  }

  public void setHwDecode(final boolean decode) {
    this.hwDecode = decode;
  }

  public void setForceHwDecode(final boolean decode) {
    this.forceHwDecode = decode;
  }

  private void setWindowSize() {
    IVLCVout vout = this.mediaPlayer.getVLCVout();
    vout.setWindowSize(this.getWidth(), this.getHeight());
  }

  private void createPlayer(@NonNull ThemedReactContext context) {
    if (this.vlc != null || this.currentSurface == null) {
      return;
    }
    ArrayList options = new ArrayList();
    for (String a : this.arguments) {
      options.add(a);
    }
    this.vlc = new LibVLC(context, options);
    this.mediaPlayer = new MediaPlayer(this.vlc);

    this.lifecycleListener.setMediaPlayer(this.mediaPlayer);

    this.mediaPlayer.setScale(0);
    //this.mediaPlayer.setAspectRatio(this.getWidth() + ":" + this.getHeight());
    this.mediaPlayer.setVolume(100);
    VlcEventEmitter emitter = new VlcEventEmitter(context, this.mediaPlayer);
    emitter.setId(this.id);
    this.mediaPlayer.setEventListener(new MediaPlayerEventListener(emitter));
    this.setWindowSize();

    IVLCVout vout = this.mediaPlayer.getVLCVout();
    vout.setVideoSurface(this.getSurfaceTexture());
    vout.attachViews(this);
    vout.addCallback(this);

    this.setUri(this.uri);
    if (this.autoplay) {
      this.mediaPlayer.play();
    }
    Log.i(TAG, "Created player");
  }

  public void setUri(String uri) {
    this.uri = uri;
    if (this.vlc == null || this.mediaPlayer == null) {
      return;
    }
    Media media = new Media(this.vlc, Uri.parse(this.uri));
    media.setHWDecoderEnabled(this.hwDecode, this.forceHwDecode);

    this.mediaPlayer.setMedia(media);
  }

  public void clear() {
    if (this.vlc != null) {
      this.vlc.release();
    }
    if (this.mediaPlayer != null) {
      this.mediaPlayer.detachViews();
      this.mediaPlayer.getVLCVout().detachViews();
      this.mediaPlayer.release();
    }
  }

  @Override
  public void onSurfaceTextureAvailable(@NonNull SurfaceTexture surfaceTexture, int i, int i1) {
    this.currentSurface = surfaceTexture;
    this.createPlayer((ThemedReactContext) this.getContext());
  }

  @Override
  public void onSurfaceTextureSizeChanged(@NonNull SurfaceTexture surfaceTexture, int i, int i1) {}

  @Override
  public boolean onSurfaceTextureDestroyed(@NonNull SurfaceTexture surfaceTexture) {
    this.currentSurface = null;
    return false;
  }

  @Override
  public void onSurfaceTextureUpdated(@NonNull SurfaceTexture surfaceTexture) {}

  @Override
  public void onLayoutChange(View view, int i, int i1, int i2, int i3, int i4, int i5, int i6, int i7) {
    if (this.vlc == null || this.mediaPlayer == null) {
      return;
    }
    this.setWindowSize();
  }

  @Override
  public void onNewVideoLayout(IVLCVout vlcVout, int width, int height, int visibleWidth, int visibleHeight, int sarNum, int sarDen) {
    Log.i(TAG, "On new video layout");
  }

  @Override
  public void onSurfacesCreated(IVLCVout vlcVout) {
    Log.i(TAG, "VLC Created surface");
  }

  @Override
  public void onSurfacesDestroyed(IVLCVout vlcVout) {
    Log.i(TAG, "VLC Deleted surface");
  }

  @Override
  public void onAudioFocusChange(int i) {

  }
}
