#if TARGET_OS_TV
#import <TVVLCKit/TVVLCKit.h>
#else
#import <MobileVLCKit/MobileVLCKit.h>
#endif
#import "react_native_turbo_vlc-Swift.h"
#import "TurboVlcView.h"

#import <react/renderer/components/RNTurboVlcViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNTurboVlcViewSpec/EventEmitters.h>
#import <react/renderer/components/RNTurboVlcViewSpec/Props.h>
#import <react/renderer/components/RNTurboVlcViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface TurboVlcView () <RCTTurboVlcViewViewProtocol>

@end

@implementation TurboVlcView {
  Heyo * _view;
}

+ (void)load
{
  [super load];
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<TurboVlcViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const TurboVlcViewProps>();
    _props = defaultProps;
        
    _view = [[Heyo alloc]
             initWithFrame: frame
             view:_view
             onError:^(NSDictionary* dictionary) {
      auto eventEmitter = std::static_pointer_cast<const TurboVlcViewEventEmitter>(self->_eventEmitter);

      eventEmitter->onError({});
    }
             onProgress:^(NSDictionary *dictionary) {
      auto eventEmitter = std::static_pointer_cast<const TurboVlcViewEventEmitter>(self->_eventEmitter);

      eventEmitter->onProgress({
        .progress = std::int32_t([[dictionary objectForKey:@"progress"] integerValue]),
        .duration = std::int32_t([[dictionary objectForKey:@"duration"] integerValue]),
      });
    }
             onVideoInfo:^(NSDictionary *dictionary) {
      auto eventEmitter = std::static_pointer_cast<const TurboVlcViewEventEmitter>(self->_eventEmitter);

      std::vector<TurboVlcViewEventEmitter::OnVideoInfoAudioTracks> audioTracks = {};
      
      for (NSDictionary* track in [dictionary objectForKey:@"audioTracks"]) {
        audioTracks.push_back({
          .id = [[track objectForKey:@"id"] UTF8String],
          .name = [[track objectForKey:@"name"] UTF8String],
        });
      }     
      
      std::vector<TurboVlcViewEventEmitter::OnVideoInfoTextTracks> textTracks = {};
      
      for (NSDictionary* track in [dictionary objectForKey:@"textTracks"]) {
        textTracks.push_back({
          .id = [track[@"id"] UTF8String],
          .name = [track[@"name"] UTF8String],
        });
      }
      
      std::vector<TurboVlcViewEventEmitter::OnVideoInfoVideoTracks> videoTracks = {};
      
      for (NSDictionary* track in [dictionary objectForKey:@"videoTracks"]) {
        videoTracks.push_back({
          .id = [[track objectForKey:@"id"] UTF8String],
          .name = [[track objectForKey:@"name"] UTF8String],
        });
      }
      
      eventEmitter->onVideoInfo({
        .duration = std::int32_t([[dictionary objectForKey:@"duration"] integerValue]),
        .currentVideoTrackId = std::string([[dictionary objectForKey:@"currentVideoTrackId"] UTF8String]),
        .currentAudioTrackId = std::string([[dictionary objectForKey:@"currentAudioTrackId"] UTF8String]),
        .currentTextTrackId = std::string([[dictionary objectForKey:@"currentTextTrackId"] UTF8String]),
        .audioTracks = audioTracks,
        .textTracks = textTracks,
        .videoTracks = videoTracks,
      });
    }
             onBuffer:^(NSDictionary *dictionary) {}
    ];
    
    self.contentView = _view;
  }
  
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<TurboVlcViewProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<TurboVlcViewProps const>(props);
  
  if (oldViewProps.volume != newViewProps.volume) {
    [_view setVolumeWithVolume:newViewProps.volume];
  }
  if (oldViewProps.uri != newViewProps.uri) {
    [_view setUriWithUri:[NSString stringWithUTF8String:newViewProps.uri.c_str()]];
  }
  if (oldViewProps.play != newViewProps.play) {
    [_view setPlayWithPlay:newViewProps.play];
  }
  if (oldViewProps.volume != newViewProps.volume) {
    [_view setVolumeWithVolume:newViewProps.volume];
  }
  if (oldViewProps.audioTrack != newViewProps.audioTrack) {
    [_view setAudioTrackWithId:[NSString stringWithUTF8String:newViewProps.audioTrack.c_str()]];
  }
  if (oldViewProps.textTrack != newViewProps.textTrack) {
    [_view setTextTrackWithId:[NSString stringWithUTF8String:newViewProps.textTrack.c_str()]];
  }
  [super updateProps:props oldProps:oldProps];
}

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args
{
  RCTTurboVlcViewHandleCommand(self, commandName, args);
}

- (void)seek:(double)ms
{
  [_view setSeekWithSeek:ms];
}


Class<RCTComponentViewProtocol> TurboVlcViewCls(void)
{
  return TurboVlcView.class;
}

@end
