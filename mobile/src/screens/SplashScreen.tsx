import React, { useEffect, useRef } from 'react';
import {
  View, Image, Text, StyleSheet, StatusBar, Animated, Easing, Dimensions,
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
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: false }),
        Animated.spring(logoScale, { toValue: 1, friction: 6, useNativeDriver: false }),
      ]),
      Animated.delay(200),
      Animated.timing(tagOpacity, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.delay(1200),
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => onFinish());
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
