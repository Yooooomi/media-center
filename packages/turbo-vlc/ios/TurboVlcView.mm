#import "TurboVlcView.h"
#import "react_native_turbo_vlc-Swift.h"

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
  NSLog(@"OBJC Load");
  [super load];
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<TurboVlcViewComponentDescriptor>();
}

- (void)prepareForRecycle {
  NSLog(@"OBJC prepare for recycle");
  [_view releasePlayer];
  [super prepareForRecycle];
}

-(void)removeFromSuperview {
  NSLog(@"OBJC remove from superview");
  [_view releasePlayer];
  [super removeFromSuperview];
}

-(void)dealloc {
  NSLog(@"I am dealloc'ing");
}

- (instancetype)initWithFrame:(CGRect)frame
{
  NSLog(@"OBJC INIT");
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
  
  auto wasReleased = [_view isReleased];
  NSLog(@"%@", [NSString stringWithFormat:@"%@%d", @"Was released: ", wasReleased]);
  [_view prepare];
  
  if (wasReleased || oldViewProps.volume != newViewProps.volume) {
    [_view setVolumeWithVolume:newViewProps.volume];
  }
  if (wasReleased || oldViewProps.uri != newViewProps.uri) {
    [_view setUriWithUri:[NSString stringWithUTF8String:newViewProps.uri.c_str()]];
  }
  if (wasReleased || oldViewProps.play != newViewProps.play) {
    [_view setPlayWithPlay:newViewProps.play || wasReleased];
  }
  if (wasReleased || oldViewProps.volume != newViewProps.volume) {
    [_view setVolumeWithVolume:newViewProps.volume];
  }
  if (wasReleased || oldViewProps.audioTrack != newViewProps.audioTrack) {
    [_view setAudioTrackWithId:[NSString stringWithUTF8String:newViewProps.audioTrack.c_str()]];
  }
  if (wasReleased || oldViewProps.textTrack != newViewProps.textTrack) {
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
