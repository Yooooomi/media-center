//
//  Header.h
//  Pods
//
//  Created by timothee on 24/09/2024.
//

#ifndef Heyo_h
#define Heyo_h

#import <VLCKit/VLCKit.h>

typedef void (^EventCallback)(NSDictionary *event);

@interface Heyo : UIView <VLCMediaPlayerDelegate, VLCMediaDelegate>

@property (nonatomic, strong) VLCLibrary *vlc;
@property (nonatomic, strong) VLCMediaPlayer *mediaPlayer;
@property (nonatomic, strong) VLCMedia *media;

@property (nonatomic, copy) EventCallback onError;
@property (nonatomic, copy) EventCallback onProgress;
@property (nonatomic, copy) EventCallback onVideoInfo;
@property (nonatomic, copy) EventCallback onBuffer;

@property (nonatomic) BOOL released;

- (instancetype)initWithFrame:(CGRect)frame
                         view:(UIView *)view
                      onError:(EventCallback)onError
                   onProgress:(EventCallback)onProgress
                   onVideoInfo:(EventCallback)onVideoInfo
                     onBuffer:(EventCallback)onBuffer;

- (void)releasePlayer;
- (void)prepare;
- (BOOL)isReleased;

- (void)setVolume:(int32_t)volume;
- (void)setUri:(NSString *)uri;
- (void)setPlay:(BOOL)play;
- (void)setSeek:(double)seek;
- (void)setAudioTrack:(NSString *)trackId;
- (void)setTextTrack:(NSString *)trackId;

@end

#endif /* Header_h */
