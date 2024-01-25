package com.turbovlc

import android.os.Handler
import android.util.Log
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.TurboVlcViewManagerDelegate
import com.facebook.react.viewmanagers.TurboVlcViewManagerInterface

@ReactModule(name = TurboVlcViewManager.NAME)
class TurboVlcViewManager : SimpleViewManager<TurboVlcView>(),
  TurboVlcViewManagerInterface<TurboVlcView> {
  private val mDelegate: ViewManagerDelegate<TurboVlcView>

  init {
    mDelegate = TurboVlcViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<TurboVlcView>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any>? {
    var existing = super.getExportedCustomDirectEventTypeConstants()
    if (existing == null) {
      existing = mutableMapOf()
    }

    val events = arrayOf(
      Pair(TurboVlcView.ProgressEvent.NAME, TurboVlcView.ProgressEvent.HANDLER_NAME),
      Pair(TurboVlcView.ErrorEvent.NAME, TurboVlcView.ErrorEvent.HANDLER_NAME),
      Pair(TurboVlcView.VideoInfoEvent.NAME, TurboVlcView.VideoInfoEvent.HANDLER_NAME),
      Pair(TurboVlcView.BufferingEvent.NAME, TurboVlcView.BufferingEvent.HANDLER_NAME)
    )
    events.forEach { it -> existing[it.first] = mapOf("registrationName" to it.second) }
    return existing
  }

  public override fun createViewInstance(context: ThemedReactContext): TurboVlcView {
    return TurboVlcView(context)
  }

  override fun onDropViewInstance(view: TurboVlcView) {
    super.onDropViewInstance(view)
    view.release()
  }

  companion object {
    const val NAME = "TurboVlcView"
  }

  @ReactProp(name = "uri")
  override fun setUri(view: TurboVlcView?, uri: String?) {
    Log.i("yey", "setUri $view $uri")
    var handler = Handler()
    handler.postDelayed(Runnable {
      Log.i("yey", "setUri delayed $view $uri")
      if (uri == null) {
        return@Runnable
      }
      view?.setUri(uri)
    }, 0)
  }

  @ReactProp(name = "play")
  override fun setPlay(view: TurboVlcView?, value: Boolean) {
    Log.i("yey", "setPlay")
    view?.setPlay(value)
  }

  @ReactProp(name = "seek")
  override fun setSeek(view: TurboVlcView?, value: Double) {
    Log.i("yey", "setSeek")
    view?.setSeek(value)
  }

  @ReactProp(name = "volume")
  override fun setVolume(view: TurboVlcView?, value: Int) {
    Log.i("yey", "setVolume")
    view?.setVolume(value)
  }

  @ReactProp(name = "audioTrack")
  override fun setAudioTrack(view: TurboVlcView?, value: String?) {
    Log.i("yey", "setAudioTrack")
    if (value == null) {
      return
    }
    view?.setAudioTrack(value)
  }

  @ReactProp(name = "textTrack")
  override fun setTextTrack(view: TurboVlcView?, value: String?) {
    Log.i("yey", "setTextTrack")
    if (value == null) {
      return
    }
    view?.setTextTrack(value)
  }

  @ReactProp(name = "arguments")
  override fun setArguments(view: TurboVlcView?, value: ReadableArray?) {
    Log.i("yey", "setArguments")
    if (value == null) {
      return
    }

    var strArguments = ArrayList<String>()
    for (i in 0 until value.size()) {
      strArguments.add(value.getString(i))
    }

    view?.setArguments(strArguments)
  }

  @ReactProp(name = "hwDecode")
  override fun setHwDecode(view: TurboVlcView?, value: Boolean) {
    Log.i("yey", "setHwDecode")
    view?.setHwDecode(value)
  }

  @ReactProp(name = "forceHwDecode")
  override fun setForceHwDecode(view: TurboVlcView?, value: Boolean) {
    Log.i("yey", "setForceHwDecode")
    view?.setForceHwDecode(value)
  }
}
