import React, { useEffect, useRef } from 'react';
import {
  View, Image, Text, StyleSheet, StatusBar, Animated, Easing, Dimensions, Platform,
} from 'react-native';
import { COLORS } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeOut   = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // On web the splash should be very brief — no need to hold the user
    const isWeb = Platform.OS === 'web';

    // Safety fallback: always dismiss after max 2.5 s (web) / 4 s (native)
    const fallback = setTimeout(onFinish, isWeb ? 2500 : 4000);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: isWeb ? 300 : 600,
          useNativeDriver: false,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: isWeb ? 350 : 700,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: false,
        }),
      ]),
      Animated.delay(isWeb ? 100 : 200),
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: isWeb ? 200 : 500,
        useNativeDriver: false,
      }),
      Animated.delay(isWeb ? 400 : 1200),
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: isWeb ? 300 : 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => { clearTimeout(fallback); onFinish(); });

    return () => clearTimeout(fallback);
  }, []);

  return (
    <Animated.View style={[s.container, { opacity: fadeOut }]}>
      <StatusBar hidden />

      <Animated.View style={[s.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Image
          source={require('../../assets/quasar-logo-transparent.png')}
          style={s.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text style={[s.tagline, { opacity: tagOpacity }]}>
        LUXURY SALON
      </Animated.Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1208',
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_W,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 160,
  },
  tagline: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 6,
    marginTop: 18,
  },
});
