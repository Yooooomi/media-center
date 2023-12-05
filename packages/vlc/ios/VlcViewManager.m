#import <React/RCTViewManager.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(VlcViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(arguments, NSArray)
RCT_EXPORT_VIEW_PROPERTY(uri, NSString)
RCT_EXPORT_VIEW_PROPERTY(volume, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(play, NSBool)
RCT_EXPORT_VIEW_PROPERTY(seek, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(audioTrack, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(textTrack, NSNumber)

@end

@interface RCT_EXTERN_MODULE(VlcEventEmitter, RCTEventEmitter)

RCT_EXTERN_METHOD(supportedEvents)

@end
