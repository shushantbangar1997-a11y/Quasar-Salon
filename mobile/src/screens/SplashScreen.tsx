import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions, StatusBar } from 'react-native';
import QuasarLogoSvg from '../components/QuasarLogoSvg';

const { width: SCREEN_W } = Dimensions.get('window');
const LOGO_W = Math.min(SCREEN_W * 0.55, 200);
const LOGO_H = LOGO_W * (290 / 220);

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fillHeight = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(fillHeight, {
        toValue: LOGO_H,
        duration: 1800,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1.0),
        useNativeDriver: false,
      }),
      Animated.delay(400),
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => {
      onFinish();
    });
  }, []);

  return (
    <Animated.View style={[s.container, { opacity: fadeOut }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Muted outline layer — always visible */}
      <View style={s.logoWrapper}>
        <View style={{ position: 'absolute', top: 0, left: 0 }}>
          <QuasarLogoSvg
            width={LOGO_W}
            height={LOGO_H}
            color="#E8DDD4"
            showText={true}
          />
        </View>

        {/* Gold fill layer — clips from bottom upward */}
        <Animated.View
          style={[
            s.fillClip,
            {
              width: LOGO_W,
              height: fillHeight,
            },
          ]}
        >
          <View style={{ position: 'absolute', bottom: 0, left: 0 }}>
            <QuasarLogoSvg
              width={LOGO_W}
              height={LOGO_H}
              color="#C9A84C"
              showText={true}
            />
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: LOGO_W,
    height: LOGO_H,
    position: 'relative',
  },
  fillClip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
});
