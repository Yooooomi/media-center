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
    
    self.mediaPlayer.scaleFactor = 0
    
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
      "progress": (self.mediaPlayer.time.value?.doubleValue ?? 0),
      "duration": (self.mediaPlayer.media?.length.value?.doubleValue ?? 0) / 1000,
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
    if aMedia.length.intValue == 0 {
      return
    }
    if self.released {
      return
    }
    self.onVideoInfo([
      "duration": (self.mediaPlayer.media?.length.value?.doubleValue ?? 0) / 1000,
      
      "audioTracks": self.getTracks(tracks: self.mediaPlayer.audioTracks),
      "videoTracks": self.getTracks(tracks: self.mediaPlayer.videoTracks),
      "textTracks": self.getTracks(tracks: self.mediaPlayer.textTracks),
      
      "currentVideoTrackId": self.mediaPlayer.videoTracks.first(where: { track in track.isSelected })?.trackId ?? "",
      "currentAudioTrackId": self.mediaPlayer.audioTracks.first(where: { track in track.isSelected })?.trackId ?? "",
      "currentTextTrackId": self.mediaPlayer.textTracks.first(where: { track in track.isSelected })?.trackId ?? "",
    ])
  }
  
  public func mediaDidFinishParsing(_ aMedia: VLCMedia) {
    print("mediaDidFinishParsing")
  }
    
  @objc
  public func setVolume(volume: Int32) {
    self.mediaPlayer.audio?.volume = volume
  }
  
  @objc
  public func setUri(uri: String) {
    guard let parsedUri = URL.init(string: uri) else { return }
    guard let media = VLCMedia(url: parsedUri) else { return }

    if let m = self.media {
      m.delegate = nil
    }
    
    self.media = media
    media.delegate = self
    self.mediaPlayer.media = self.media

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
    self.mediaPlayer.videoTracks.forEach { track in
      track.isSelected = track.trackId == id
    }
    if id == "default" {
      if let first = self.mediaPlayer.videoTracks.first {
        first.isSelected = true
      }
    }
  }
  
  @objc
  public func setTextTrack(id: String) {
    self.mediaPlayer.textTracks.forEach { track in
      track.isSelected = track.trackId == id
    }
    if id == "default" {
      if let first = self.mediaPlayer.textTracks.first {
        first.isSelected = true
      }
    }
  }
}
