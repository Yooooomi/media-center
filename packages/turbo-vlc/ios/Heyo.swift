import Foundation
import UIKit

public typealias EventCallback = (_ event: NSDictionary) -> Void

@objcMembers
public class Heyo: UIView, VLCMediaPlayerDelegate, VLCMediaDelegate {
  private var vlc: VLCLibrary
  private var mediaPlayer: VLCMediaPlayer
  private var media: VLCMedia?
  
  private var onError: EventCallback
  private var onProgress: EventCallback
  private var onVideoInfo: EventCallback
  private var onBuffer: EventCallback
  
  private var released = false
  
  @objc
  public init(frame: CGRect, view: UIView, onError: @escaping EventCallback, onProgress: @escaping EventCallback, onVideoInfo: @escaping EventCallback, onBuffer: @escaping EventCallback) {
        
    self.vlc = VLCLibrary()
    self.mediaPlayer = VLCMediaPlayer(library: self.vlc)
    
    self.mediaPlayer.scaleFactor = 0.1
    
    self.onError = onError
    self.onProgress = onProgress
    self.onVideoInfo = onVideoInfo
    self.onBuffer = onBuffer
    
    super.init(frame: frame)
    
    self.mediaPlayer.delegate = self
    self.mediaPlayer.drawable = self
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  deinit {
    print("SWIFT deinit")
  }
  
  @objc
  public func releasePlayer() {
    self.released = true
    self.mediaPlayer.stop()
  }
  
  @objc func prepare() {
    self.released = false
  }
  
  @objc func isReleased() -> Bool {
    return self.released
  }
  
  public func mediaPlayerStateChanged(_ newState: VLCMediaPlayerState) {
    print("mediaPlayerStateChanged")
  }
  
  public func mediaPlayerLengthChanged(_ length: Int64) {
    print("mediaPlayerLengthChanged")
  }
  
  public func mediaPlayerTrackSelected(selectedId unselectedId: String, unselectedId unselectedId2: String) {
    print("mediaPlayerTrackSelected")
  }
  
  public func mediaPlayerTrackAdded(_ trackId: String) {
    print("mediaPlayerTrackAdded")
  }
  
  public func mediaPlayerTimeChanged(_ aNotification: Notification) {
    if self.released {
      return
    }
    self.onProgress([
      "progress": self.mediaPlayer.time.intValue,
      "duration": self.mediaPlayer.media?.length.intValue ?? 0,
    ])
  }
  
  private func getTracks(tracks: [VLCMediaPlayer.Track]) -> NSMutableArray {
    let a: NSMutableArray = []
    tracks.forEach({ track in
      a.add([
        "id": track.trackId,
        "name": "\(track.trackName) \(track.trackDescription ?? "")",
      ])
    })
    return a
  }
  
  public func mediaMetaDataDidChange(_ aMedia: VLCMedia) {
    print("mediaMetaDataDidChange")
  }
  
  public func mediaDidFinishParsing(_ aMedia: VLCMedia) {
    if self.released {
      return
    }
    self.onVideoInfo([
      "duration": self.mediaPlayer.media?.length.intValue ?? 0,
      
      "audioTracks": self.getTracks(tracks: self.mediaPlayer.audioTracks),
      "videoTracks": self.getTracks(tracks: self.mediaPlayer.videoTracks),
      "textTracks": self.getTracks(tracks: self.mediaPlayer.textTracks),
      
      "currentVideoTrackId": self.mediaPlayer.videoTracks.first(where: { track in track.isSelected })?.trackId ?? "",
      "currentAudioTrackId": self.mediaPlayer.audioTracks.first(where: { track in track.isSelected })?.trackId ?? "",
      "currentTextTrackId": self.mediaPlayer.textTracks.first(where: { track in track.isSelected })?.trackId ?? "",
    ])
  }
    
  @objc
  public func setVolume(volume: Int32) {
    self.mediaPlayer.audio?.volume = volume
  }
  
  @objc
  public func setUri(uri: String) {
    guard let parsedUri = URL.init(string: uri) else { return }
    guard let media = VLCMedia(url: parsedUri) else { return }

    if let media = self.media {
      media.delegate = nil
    }
    
    self.media = media
    self.mediaPlayer.media = self.media
    self.mediaPlayer.media?.delegate = self

    print("PLAYING")
    
    self.mediaPlayer.play()
  }
  
  @objc
  public func setPlay(play: Bool) {
    print("Updating play \(play)")
    guard (self.mediaPlayer.media != nil) else { return }
    print("Updating play after \(play)")
    if play {
      self.mediaPlayer.play()
    } else {
      self.mediaPlayer.pause()
    }
  }
  
  @objc
  public func setSeek(seek: Double) {
    self.mediaPlayer.time = VLCTime(int: Int32(seek))
  }
  
  @objc
  public func setAudioTrack(id: String) {
    let audioTrack = self.mediaPlayer.videoTracks.first { track in
      track.trackId == id
    }
    audioTrack?.isSelected = true
  }
  
  @objc
  public func setTextTrack(id: String) {
    let textTrack = self.mediaPlayer.textTracks.first { track in
      track.trackId == id
    }
    textTrack?.isSelected = true
  }
}
