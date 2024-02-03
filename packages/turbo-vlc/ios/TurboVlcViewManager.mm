#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import <React/RCTBridge.h>

@interface TurboVlcViewManager : RCTViewManager
@end

@implementation TurboVlcViewManager

RCT_EXPORT_MODULE(TurboVlcView)

RCT_EXPORT_VIEW_PROPERTY(volume, Int32)
RCT_EXPORT_VIEW_PROPERTY(uri, NSString)

RCT_EXPORT_VIEW_PROPERTY(onError, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onProgress, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onVideoInfo, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onBuffer, RCTDirectEventBlock)

- (UIView *)view
{
  return [[UIView alloc] init];
}

@end
