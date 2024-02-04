package com.vlc;

import android.graphics.Color;
import android.net.Uri;
import android.util.Log;
import android.view.Gravity;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import org.videolan.libvlc.LibVLC;
import org.videolan.libvlc.Media;
import org.videolan.libvlc.MediaPlayer;
import org.videolan.libvlc.interfaces.IMedia;
import org.videolan.libvlc.interfaces.IVLCVout;

import java.util.ArrayList;


public class VlcView extends FrameLayout implements IVLCVout.OnNewVideoLayoutListener {
  private static String TAG = "VlcView";
  private LibVLC vlc;
  private MediaPlayer mediaPlayer;
  private SurfaceView surfaceView;

  // Props
  private ArrayList<String> arguments = new ArrayList<>();
  private boolean hwDecode = true;
  private boolean forceHwDecode = false;

  public VlcView(@NonNull ThemedReactContext context) {
    super(context);

    setBackgroundColor(Color.parseColor("#000000"));

    surfaceView = new SurfaceView(context);
    addView(surfaceView);

    vlc = new LibVLC(getContext());
    mediaPlayer = new MediaPlayer(vlc);
    mediaPlayer.setVolume(100);

    mediaPlayer.getVLCVout().setWindowSize(getWidth(), getHeight());
    mediaPlayer.getVLCVout().setVideoView(surfaceView);
    mediaPlayer.getVLCVout().attachViews(this);
  }

  private void playMediaFromUri(Uri uri) {
    Media media = new Media(vlc, uri);
    media.setHWDecoderEnabled(true, false);

    mediaPlayer.setMedia(media);

    mediaPlayer.getMedia().setEventListener(new IMedia.EventListener() {
      @Override
      public void onEvent(IMedia.Event event) {
        if (event.type != IMedia.Event.MetaChanged) {
          return;
        }
        IMedia.Track[] tracks = mediaPlayer.getMedia().getTracks(IMedia.Track.Type.Video);
        if (tracks.length == 0) {
          return;
        }
        IMedia.VideoTrack track = (IMedia.VideoTrack) tracks[0];
        if (track.width == 0 || track.height == 0) {
          return
        }

        float ratio = (float) track.width / (float) track.height;
        int measuredWidth = getMeasuredWidth();
        int measuredHeight = getMeasuredHeight();
        int width = measuredWidth;
        int height = measuredHeight;

        float viewAspectRatio = (float) measuredWidth / measuredHeight;
        float aspectDeformation = ratio / viewAspectRatio - 1;
        if (Math.abs(aspectDeformation) <= 0.01f) {
          return;
        }

        if (aspectDeformation > 0) {
          height = (int) (measuredWidth / ratio);
        } else {
          width = (int) (measuredHeight * ratio);
        }

        LayoutParams params = new LayoutParams(width, height);
        params.gravity = Gravity.CENTER;
        surfaceView.setLayoutParams(params);
        requestLayout();
      }
    });
    mediaPlayer.play();
  }

  public void setAudioTrack(final String id) {
    mediaPlayer.selectTrack(id);
  }

  public void setTextTrack(final String id) {
    mediaPlayer.selectTrack(id);
  }

  public void setArguments(final ArrayList<String> arguments) {
    this.arguments = arguments;
  }

  public void setPlay(final boolean playing) {
    if (playing) {
      this.mediaPlayer.play();
    } else {
      this.mediaPlayer.pause();
    }
  }

  public void setHwDecode(final boolean decode) {
    this.hwDecode = decode;
  }

  public void setForceHwDecode(final boolean decode) {
    this.forceHwDecode = decode;
  }

  public void setVolume(final int volume) {
    this.mediaPlayer.setVolume(volume);
  }

  public void setSeek(final int position) {
    this.mediaPlayer.setTime(position);
  }

  public void setUri(final String uri) {
    this.playMediaFromUri(Uri.parse(uri));
  }

  public void release() {
    mediaPlayer.stop();
    mediaPlayer.detachViews();
    mediaPlayer.release();
    vlc.release();
  }

  private WritableMap getBasicEvent() {
    WritableMap map = Arguments.createMap();
    map.putInt("id", this.id);
    map.putDouble("progress", this.mediaPlayer.getTime());
    map.putDouble("duration", this.mediaPlayer.getLength());

    return map;
  }

  private void initEvents() {
    mediaPlayer.setEventListener(new MediaPlayer.EventListener() {
      @Override
      public void onEvent(MediaPlayer.Event event) {
        if (event.type == MediaPlayer.Event.TimeChanged) {

        }
        if (event.type == MediaPlayer.Event.EncounteredError) {

        }
        if (event.type == MediaPlayer.Event.Buffering) {

        }
      }
    });
  }

  @Override
  public void requestLayout() {
    super.requestLayout();

    // This view relies on a measure + layout pass happening after it calls requestLayout().
    // https://github.com/facebook/react-native/issues/4990#issuecomment-180415510
    // https://stackoverflow.com/questions/39836356/react-native-resize-custom-ui-component
    post(new Runnable() {
      @Override
      public void run() {
        measure(MeasureSpec.makeMeasureSpec(getWidth(), MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(getHeight(), MeasureSpec.EXACTLY));
        layout(getLeft(), getTop(), getRight(), getBottom());
      }
    });
  }

  @Override
  public void onNewVideoLayout(IVLCVout vlcVout, int width, int height, int visibleWidth, int visibleHeight, int sarNum, int sarDen) {}
}
