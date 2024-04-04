#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import <React/RCTBridge.h>

@interface TurboVlcViewManager : RCTViewManager
@end

@implementation TurboVlcViewManager

RCT_EXPORT_MODULE(TurboVlcView)

- (UIView *)view
{
  return [[UIView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(color, NSString)

@end
