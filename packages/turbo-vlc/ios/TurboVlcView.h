// This guard prevent this file to be compiled in the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTViewComponentView.h>
#import <React/RCTComponent.h>
#import <UIKit/UIKit.h>

#import <react/renderer/components/RNTurboVlcViewSpec/EventEmitters.h>

#ifndef TurboVlcViewNativeComponent_h
#define TurboVlcViewNativeComponent_h

NS_ASSUME_NONNULL_BEGIN

@interface TurboVlcView : RCTViewComponentView

@property (nonatomic, copy) RCTDirectEventBlock onError;
@property (nonatomic, copy) RCTDirectEventBlock onProgress;
@property (nonatomic, copy) RCTDirectEventBlock onVideoInfo;
@property (nonatomic, copy) RCTDirectEventBlock onBuffer;

@end

NS_ASSUME_NONNULL_END

#endif /* TurboVlcViewNativeComponent_h */
#endif /* RCT_NEW_ARCH_ENABLED */
