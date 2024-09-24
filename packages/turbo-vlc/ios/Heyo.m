//
//  Heyo.m
//  react-native-turbo-vlc
//
//  Created by timothee on 24/09/2024.
//

#import <Foundation/Foundation.h>
#import <VLCKit/VLCKit.h>
#import "Heyo.h"

@implementation Heyo

- (instancetype)initWithFrame:(CGRect)frame
                         view:(UIView *)view
                      onError:(EventCallback)onError
                   onProgress:(EventCallback)onProgress
                   onVideoInfo:(EventCallback)onVideoInfo
                     onBuffer:(EventCallback)onBuffer {
    self = [super initWithFrame:frame];
    if (self) {
        self.vlc = [[VLCLibrary alloc] init];
        self.mediaPlayer = [[VLCMediaPlayer alloc] initWithLibrary:self.vlc];
        self.mediaPlayer.scaleFactor = 0;
        
        self.onError = onError;
        self.onProgress = onProgress;
        self.onVideoInfo = onVideoInfo;
        self.onBuffer = onBuffer;
        
        self.released = NO;
        self.mediaPlayer.delegate = self;
        self.mediaPlayer.drawable = self;
    }
    return self;
}

- (void)dealloc {
    NSLog(@"Objective-C dealloc");
}

- (void)releasePlayer {
    self.released = YES;
    [self.mediaPlayer stop];
}

- (void)prepare {
    self.released = NO;
}

- (BOOL)isReleased {
    return self.released;
}

#pragma mark - VLCMediaPlayerDelegate

- (void)mediaPlayerStateChanged:(VLCMediaPlayerState)aNotification {
    NSLog(@"mediaPlayerStateChanged");
}

- (void)mediaPlayerLengthChanged:(int64_t)aNotification {
    NSLog(@"mediaPlayerLengthChanged");
}

- (void)mediaPlayerTrackSelected:(NSString *)selectedId unselectedId:(NSString *)unselectedId {
    NSLog(@"mediaPlayerTrackSelected");
}

- (void)mediaPlayerTrackAdded:(NSString *)trackId {
    NSLog(@"mediaPlayerTrackAdded");
}

- (void)mediaPlayerTimeChanged:(NSNotification *)aNotification {
    if (self.released) return;
    
    NSDictionary *progress = @{
        @"progress": @((self.mediaPlayer.time.value ? self.mediaPlayer.time.value.doubleValue : 0)),
        @"duration": @((self.mediaPlayer.media.length.value ? self.mediaPlayer.media.length.value.doubleValue : 0) / 1000)
    };
    
    if (self.onProgress) {
        self.onProgress(progress);
    }
}

- (NSArray *)getTracks:(NSArray<VLCMediaPlayerTrack *> *)tracks {
    NSMutableArray *result = [NSMutableArray array];
    for (VLCMediaPlayerTrack *track in tracks) {
        [result addObject:@{
            @"id": track.trackId,
            @"name": [NSString stringWithFormat:@"%@ %@", track.trackName, track.trackDescription ?: @""]
        }];
    }
    return result;
}

#pragma mark - VLCMediaDelegate

- (void)mediaMetaDataDidChange:(VLCMedia *)aMedia {
    if (aMedia.length.intValue == 0 || self.released) return;

    NSDictionary *videoInfo = @{
        @"duration": @((self.mediaPlayer.media.length.value.doubleValue) / 1000),
        @"audioTracks": [self getTracks:self.mediaPlayer.audioTracks],
        @"videoTracks": [self getTracks:self.mediaPlayer.videoTracks],
        @"textTracks": [self getTracks:self.mediaPlayer.textTracks],
        @"currentVideoTrackId": [self getSelectedTrackId:self.mediaPlayer.videoTracks],
        @"currentAudioTrackId": [self getSelectedTrackId:self.mediaPlayer.audioTracks],
        @"currentTextTrackId": [self getSelectedTrackId:self.mediaPlayer.textTracks]
    };
    
    if (self.onVideoInfo) {
        self.onVideoInfo(videoInfo);
    }
}

- (NSString *)getSelectedTrackId:(NSArray<VLCMediaPlayerTrack *> *)tracks {
    for (VLCMediaPlayerTrack *track in tracks) {
        if (track.isSelected) {
            return track.trackId;
        }
    }
    return @"";
}

- (void)mediaDidFinishParsing:(VLCMedia *)aMedia {
    NSLog(@"mediaDidFinishParsing");
}

#pragma mark - Setters

- (void)setVolume:(int32_t)volume {
    self.mediaPlayer.audio.volume = volume;
}

- (void)setUri:(NSString *)uri {
    NSURL *parsedUri = [NSURL URLWithString:uri];
    if (!parsedUri) return;

    VLCMedia *media = [[VLCMedia alloc] initWithURL:parsedUri];
    if (!media) return;

    if (self.media) {
        self.media.delegate = nil;
    }

    self.media = media;
    self.media.delegate = self;
    self.mediaPlayer.media = media;
    
    NSLog(@"PLAYING");
    [self.mediaPlayer play];
}

- (void)setPlay:(BOOL)play {
    NSLog(@"Updating play %d", play);
    if (!self.mediaPlayer.media) return;

    if (play) {
        [self.mediaPlayer play];
    } else {
        [self.mediaPlayer pause];
    }
}

- (void)setSeek:(double)seek {
    self.mediaPlayer.time = [VLCTime timeWithInt:(int32_t)seek];
}

- (void)setAudioTrack:(NSString *)trackId {
    for (VLCMediaPlayerTrack *track in self.mediaPlayer.audioTracks) {
        track.selected = [track.trackId isEqualToString:trackId];
    }
    
    if ([trackId isEqualToString:@"default"]) {
        VLCMediaPlayerTrack *firstTrack = self.mediaPlayer.audioTracks.firstObject;
        if (firstTrack) {
            firstTrack.selected = YES;
        }
    }
}

- (void)setTextTrack:(NSString *)trackId {
    for (VLCMediaPlayerTrack *track in self.mediaPlayer.textTracks) {
        track.selected = [track.trackId isEqualToString:trackId];
    }
    
    if ([trackId isEqualToString:@"default"]) {
        VLCMediaPlayerTrack *firstTrack = self.mediaPlayer.textTracks.firstObject;
        if (firstTrack) {
            firstTrack.selected = YES;
        }
    }
}

@end
