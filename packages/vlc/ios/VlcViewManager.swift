import MobileVLCKit
import React

@objc(VlcViewManager)
class VlcViewManager: RCTViewManager {
  override func view() -> (VlcView) {
    let view = VlcView()
    view.setup()
    return view
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }
}

@objc(VlcEventEmitter)
open class VlcEventEmitter: RCTEventEmitter {

  public static var emitter: RCTEventEmitter!

  override init() {
    super.init()
    VlcEventEmitter.emitter = self
  }

  open override func supportedEvents() -> [String] {
    ["onVideoInfos", "onProgress"]
  }
  
  @objc public override static func requiresMainQueueSetup() -> Bool {
    return false
  }
}

class VlcView : UIView, VLCMediaPlayerDelegate {
  override func removeFromSuperview() {
    self.vlcPlayer?.stop()
    self.vlcPlayer = nil
    super.removeFromSuperview()
  }
  
  @objc var uri: String = "" {
    didSet {
      self.playUri()
    }
  }
  
  @objc var play: Bool = true {
    didSet {
      self.setPlay()
    }
  }
  
  @objc var volume: Float = 100 {
    didSet {
      self.setVolume()
    }
  }
  
  @objc var arguments: [String] = []
  
  @objc var seek: Float = 0 {
    didSet {
      self.setSeek()
    }
  }
  
  @objc var audioTrack: Float = 0 {
    didSet {
      self.setAudioTrack()
    }
  }
  
  @objc var textTrack: Float = 0 {
    didSet {
      self.setTextTrack()
    }
  }
  
  func setup() {
    NotificationCenter.default.addObserver(forName: UIApplication.willResignActiveNotification, object: nil, queue: .main, using: self.willBlur)
  }
  
  lazy var willBlur: (Notification) -> Void = { [weak self] _ in
    guard let vlcPlayer = self?.vlcPlayer else  { return }
    vlcPlayer.pause()
  }
  
  var vlcPlayer: VLCMediaPlayer?
  var media: VLCMedia?
  
  func initPlayerIfNeeded() {
    if vlcPlayer != nil {
      return
    }
    NSLog("Initializing VLCMediaPlayer with arguments: \(self.arguments)")
    self.vlcPlayer = VLCMediaPlayer(options: self.arguments)
    self.vlcPlayer!.drawable = self
    self.vlcPlayer!.delegate = self
  }
  
  func playUri() {
    self.initPlayerIfNeeded()
    let url = URL(string: self.uri)
    guard let url = url else { return }
    self.media = VLCMedia(url: url)
    self.vlcPlayer!.media = self.media
    self.vlcPlayer!.play()
    
    self.setVolume()
    self.setPlay()
  }
  
  func setPlay() {
    if self.play {
      self.vlcPlayer?.play()
    } else {
      self.vlcPlayer?.pause()
    }
  }
  
  func setVolume() {
    NSLog("Setting volume to \(self.volume)")
    self.vlcPlayer?.audio?.volume = Int32(self.volume)
  }
  
  func setSeek() {
    self.vlcPlayer?.time = VLCTime(int: Int32(self.seek))
  }
  
  func setAudioTrack() {
    self.vlcPlayer?.audioChannel = Int32(self.audioTrack)
  }
  
  func setTextTrack() {
    self.vlcPlayer?.currentVideoSubTitleIndex = Int32(self.textTrack)
  }
  
  func buildBasicEvent(_ vlcPlayer: VLCMediaPlayer) -> Dictionary<String, Any?> {
    return [
      "progress": vlcPlayer.time.intValue,
      "duration": vlcPlayer.media?.length.intValue,
    ]
  }
  
  func mediaPlayerStateChanged(_ aNotification: Notification) {
    guard let vlcPlayer = self.vlcPlayer else { return }
    
    var audioTracks: [Dictionary<String, Any?>] = []
    var subtitleTracks: [Dictionary<String, Any?>] = []
    
    for i in 0..<vlcPlayer.numberOfAudioTracks {
      audioTracks.append([
        "id": vlcPlayer.audioTrackIndexes[Int(i)],
        "name": vlcPlayer.audioTrackNames[Int(i)],
      ])
    }
    
    for i in 0..<vlcPlayer.numberOfSubtitlesTracks {
      subtitleTracks.append([
        "id": vlcPlayer.videoSubTitlesIndexes[Int(i)],
        "name": vlcPlayer.videoSubTitlesNames[Int(i)],
      ])
    }
    
    let mergedEventBody = self.buildBasicEvent(vlcPlayer).merging([
      "audioTrack": vlcPlayer.numberOfAudioTracks,
      "textTrack": vlcPlayer.numberOfSubtitlesTracks,
      "availableAudioTracks": audioTracks,
      "availableTextTracks": subtitleTracks,
    ]) { (current, new) in new }

        
    VlcEventEmitter.emitter.sendEvent(withName: "onVideoInfos", body: mergedEventBody)
  }
  
  func mediaPlayerTimeChanged(_ aNotification: Notification) {
    guard let vlcPlayer = self.vlcPlayer else { return }
    
    VlcEventEmitter.emitter.sendEvent(withName: "onProgress", body: self.buildBasicEvent(vlcPlayer))
  }
}
