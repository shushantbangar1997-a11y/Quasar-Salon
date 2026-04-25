import React, { useEffect, useRef, useState } from 'react';
import {
  View, Pressable, Text, StyleSheet, StatusBar, Animated, Easing, Dimensions,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [muted, setMuted] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const fadeOut = useRef(new Animated.Value(1)).current;
  const videoRef = useRef<Video>(null);
  const didFinish = useRef(false);

  const finish = () => {
    if (didFinish.current) return;
    didFinish.current = true;
    Animated.timing(fadeOut, {
      toValue: 0,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start(() => onFinish());
  };

  useEffect(() => {
    const timeout = setTimeout(() => finish(), 20000);
    return () => clearTimeout(timeout);
  }, []);

  const handlePlaybackStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish) finish();
  };

  return (
    <Animated.View style={[s.container, { opacity: fadeOut }]}>
      <StatusBar hidden />

      <Video
        ref={videoRef}
        source={require('../../assets/quasar_intro.mp4')}
        style={s.video}
        shouldPlay
        isMuted={muted}
        isLooping={false}
        resizeMode={ResizeMode.COVER}
        onPlaybackStatusUpdate={handlePlaybackStatus}
        onReadyForDisplay={() => setVideoReady(true)}
        onError={() => { setVideoError(true); finish(); }}
      />

      {videoReady && (
        <>
          <Pressable style={s.muteBtn} onPress={() => setMuted(v => !v)}>
            <Text style={s.muteBtnText}>{muted ? '🔇' : '🔊'}</Text>
          </Pressable>

          <Pressable style={s.skipBtn} onPress={finish}>
            <Text style={s.skipText}>Skip  ›</Text>
          </Pressable>
        </>
      )}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    width: SCREEN_W,
    height: SCREEN_H,
  },
  video: {
    position: 'absolute',
    top: 0, left: 0,
    width: SCREEN_W,
    height: SCREEN_H,
  },
  muteBtn: {
    position: 'absolute',
    bottom: 80,
    left: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 24,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muteBtnText: {
    fontSize: 20,
  },
  skipBtn: {
    position: 'absolute',
    bottom: 72,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  skipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
