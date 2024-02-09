#import <React/RCTViewManager.h>
#import "TurboVlcView.h"

#if TARGET_OS_TV
#import <TVVLCKit/TVVLCKit.h>
#else
#import <MobileVLCKit/MobileVLCKit.h>
#endif
