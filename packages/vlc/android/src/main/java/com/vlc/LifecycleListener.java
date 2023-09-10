package com.vlc;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.uimanager.ThemedReactContext;

import org.videolan.libvlc.MediaPlayer;

public class LifecycleListener implements LifecycleEventListener {
    public LifecycleListener(ThemedReactContext context) {
        context.addLifecycleEventListener(this);
    }

    private MediaPlayer mediaPlayer;

    public void setMediaPlayer(MediaPlayer mediaPlayer) {
        this.mediaPlayer = mediaPlayer;
    }

    @Override
    public void onHostResume() {}

    @Override
    public void onHostPause() {
        this.mediaPlayer.pause();
    }

    @Override
    public void onHostDestroy() {}
}
