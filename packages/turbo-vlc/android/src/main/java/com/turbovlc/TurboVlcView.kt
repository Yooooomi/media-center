package com.turbovlc

import android.content.Context
import android.util.AttributeSet
import android.graphics.Color
import android.net.Uri
import android.util.Log
import android.view.Gravity
import android.view.SurfaceView
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import org.videolan.libvlc.LibVLC
import org.videolan.libvlc.Media
import org.videolan.libvlc.MediaPlayer
import org.videolan.libvlc.interfaces.IMedia
import org.videolan.libvlc.interfaces.IMedia.Track
import org.videolan.libvlc.interfaces.IVLCVout
import org.videolan.libvlc.interfaces.IVLCVout.OnNewVideoLayoutListener
import org.videolan.libvlc.util.DisplayManager
import org.videolan.libvlc.util.VLCVideoLayout
import kotlin.collections.ArrayList
import kotlin.math.abs

class TurboVlcView : FrameLayout, OnNewVideoLayoutListener, LifecycleEventListener {
  constructor(context: Context) : super(context)
  constructor(context: Context, attrs: AttributeSet?) : super(context, attrs)
  constructor(context: Context, attrs: AttributeSet?, defStyleAttr: Int) : super(
    context,
    attrs,
    defStyleAttr
  )

  private val vlc: LibVLC
  private val mediaPlayer: MediaPlayer

  private var arguments = ArrayList<String>()
  private var hwDecode = true
  private var forceHwDecode = false

  init {
    setBackgroundColor(Color.parseColor("#000000"))

    vlc = LibVLC(context)

    var layout = VLCVideoLayout(context)
    addView(layout)

    mediaPlayer = MediaPlayer(vlc)
    mediaPlayer.volume = 100
    mediaPlayer.attachViews(layout, null, true, false)
    mediaPlayer.vlcVout.setWindowSize(width, height)

    (context as ThemedReactContext).addLifecycleEventListener(this)

    this.initEvents()
  }

  private fun playMediaFromUri(uri: Uri) {
    val media = Media(vlc, uri)
    media.setHWDecoderEnabled(this.hwDecode, this.forceHwDecode)

    mediaPlayer.media = media
    mediaPlayer.media?.setEventListener { event ->
      if (event.type != IMedia.Event.ParsedChanged) {
        return@setEventListener
      }
      val tracks = mediaPlayer.media?.getTracks(Track.Type.Video)
      if (tracks.isNullOrEmpty()) {
        return@setEventListener
      }
      val track = tracks[0] as IMedia.VideoTrack
      if (track.width == 0 || track.height == 0) {
        return@setEventListener
      }

      val eventDispatcher =
        UIManagerHelper.getEventDispatcherForReactTag(context as ReactContext, id)
      val surfaceId = UIManagerHelper.getSurfaceId(context as ReactContext)

      val media = mediaPlayer.media

      if (media != null) {
        eventDispatcher?.dispatchEvent(
          VideoInfoEvent(
            surfaceId,
            id,
            media.duration.toDouble(),
            mediaPlayer.getSelectedTrack(Track.Type.Video)?.id ?: null,
            mediaPlayer.getSelectedTrack(Track.Type.Audio)?.id ?: null,
            mediaPlayer.getSelectedTrack(Track.Type.Text)?.id ?: null,
            media.getTracks(Track.Type.Video) ?: arrayOf(),
            media.getTracks(Track.Type.Audio) ?: arrayOf(),
            media.getTracks(Track.Type.Text) ?: arrayOf(),
          )
        )
      }
    }
    mediaPlayer.play()
  }

  fun setAudioTrack(id: String) {
    if (id == "default") {
      var first = mediaPlayer.getTracks(Track.Type.Audio)?.firstOrNull()
      if (first != null) {
        mediaPlayer.selectTrack(first.id)
      }
    } else {
      mediaPlayer.selectTrack(id)
    }
  }

  fun setTextTrack(id: String) {
    if (id == "default") {
      var first = mediaPlayer.getTracks(Track.Type.Text)?.firstOrNull()
      if (first != null) {
        mediaPlayer.selectTrack(first.id)
      }
    } else {
      mediaPlayer.selectTrack(id)
    }
  }

  fun setArguments(arguments: ArrayList<String>) {
    this.arguments = arguments
  }

  fun setPlay(playing: Boolean) {
    if (!mediaPlayer.hasMedia() || mediaPlayer.isPlaying == playing) {
      return
    }
    if (playing) {
      mediaPlayer.play()
    } else {
      mediaPlayer.pause()
    }
  }

  fun setHwDecode(decode: Boolean) {
    this.hwDecode = decode
  }

  fun setForceHwDecode(decode: Boolean) {
    this.forceHwDecode = decode
  }

  fun setVolume(volume: Int) {
    mediaPlayer.volume = volume
  }

  fun setSeek(position: Double) {
    Log.i("yey", "Seeking to $position")
    if (!mediaPlayer.hasMedia()) {
      return
    }
    mediaPlayer.time = position.toLong()
  }

  fun setUri(uri: String) {
    val media = mediaPlayer.media
    if (media != null && media.uri.toString() == uri) {
      return
    }
    playMediaFromUri(Uri.parse(uri))
  }

  fun release() {
    mediaPlayer.stop()
    mediaPlayer.detachViews()
    mediaPlayer.release()
    vlc.release()
    (context as ThemedReactContext).removeLifecycleEventListener(this)
  }

  class ErrorEvent(
    surfaceId: Int,
    viewId: Int,
  ) : Event<ErrorEvent>(surfaceId, viewId) {

    companion object {
      const val NAME = "ErrorEvent"
      const val HANDLER_NAME = "onError"
    }

    override fun getEventName(): String {
      return NAME
    }

    override fun getEventData(): WritableMap? {
      return Arguments.createMap()
    }
  }

  class ProgressEvent(
    surfaceId: Int,
    viewId: Int,
    private val progress: Int,
    private val duration: Int
  ) : Event<ProgressEvent>(surfaceId, viewId) {
    companion object {
      const val NAME = "ProgressEvent"
      const val HANDLER_NAME = "onProgress"
    }

    override fun getEventName(): String {
      return NAME
    }

    override fun getEventData(): WritableMap? {
      val map = Arguments.createMap()
      map.putInt("progress", this.progress)
      map.putInt("duration", this.duration)
      return map
    }
  }

  class VideoInfoEvent(
    surfaceId: Int,
    viewId: Int,
    private val duration: Double,
    private val currentVideoTrackId: String?,
    private val currentAudioTrackId: String?,
    private val currentTextTrackId: String?,
    private val videoTracks: Array<Track>,
    private val audioTracks: Array<Track>,
    private val textTracks: Array<Track>
  ) : Event<VideoInfoEvent>(surfaceId, viewId) {

    companion object {
      const val NAME = "VideoInfo"
      const val HANDLER_NAME = "onVideoInfo"
    }

    override fun getEventName(): String {
      return NAME
    }

    private fun getTrackArray(tracks: Array<Track>): WritableArray {
      return Arguments.createArray().apply {
        tracks.forEach {
          this.pushMap(Arguments.createMap().apply {
            this.putString("id", it.id)
            this.putString("name", "${it.language} ${it.description}")
          })
        }
      }
    }

    override fun getEventData(): WritableMap? {
      val map = Arguments.createMap()
      map.putDouble("duration", this.duration)

      map.putArray("audioTracks", this.getTrackArray(this.audioTracks))
      map.putArray("videoTracks", this.getTrackArray(this.videoTracks))
      map.putArray("textTracks", this.getTrackArray(this.textTracks))

      map.putString("currentVideoTrackId", this.currentVideoTrackId)
      map.putString("currentAudioTrackId", this.currentAudioTrackId)
      map.putString("currentTextTrackId", this.currentTextTrackId)

      return map
    }
  }

  class BufferingEvent(
    surfaceId: Int,
    viewId: Int,
    private val buffer: Double,
  ) : Event<BufferingEvent>(surfaceId, viewId) {
    companion object {
      const val NAME = "Buffering"
      const val HANDLER_NAME = "onBuffer"
    }

    override fun getEventName(): String {
      return NAME
    }

    override fun getEventData(): WritableMap? {
      val map = Arguments.createMap()
      map.putDouble("buffering", this.buffer)
      return map
    }
  }

  private fun initEvents() {
    mediaPlayer.setEventListener { event ->
      if (event.type == MediaPlayer.Event.TimeChanged) {
        val eventDispatcher =
          UIManagerHelper.getEventDispatcherForReactTag(context as ReactContext, id)
        val surfaceId = UIManagerHelper.getSurfaceId(context as ReactContext)
        eventDispatcher?.dispatchEvent(
          ProgressEvent(
            surfaceId,
            id,
            mediaPlayer.time.toInt(),
            mediaPlayer.length.toInt()
          )
        )
      }
      if (event.type == MediaPlayer.Event.EncounteredError) {
        val eventDispatcher =
          UIManagerHelper.getEventDispatcherForReactTag(context as ReactContext, id)
        val surfaceId = UIManagerHelper.getSurfaceId(context as ReactContext)
        eventDispatcher?.dispatchEvent(ErrorEvent(surfaceId, id))
      }
      if (event.type == MediaPlayer.Event.Buffering) {
        val eventDispatcher =
          UIManagerHelper.getEventDispatcherForReactTag(context as ReactContext, id)
        val surfaceId = UIManagerHelper.getSurfaceId(context as ReactContext)
        eventDispatcher?.dispatchEvent(
          BufferingEvent(
            surfaceId,
            id,
            event.buffering.toDouble()
          )
        )
      }
    }
  }

  override fun requestLayout() {
    super.requestLayout()

    post {
      measure(
        MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
        MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
      )
      layout(left, top, right, bottom)
    }
  }

  override fun onNewVideoLayout(
    vlcVout: IVLCVout,
    width: Int,
    height: Int,
    visibleWidth: Int,
    visibleHeight: Int,
    sarNum: Int,
    sarDen: Int
  ) {}

  override fun onHostResume() {}

  override fun onHostPause() {
    this.setPlay(false)
  }

  override fun onHostDestroy() {}
}

