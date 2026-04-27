import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  ImageSourcePropType,
  ImageResizeMode,
  ImageStyle,
} from 'react-native';
import { COLORS } from '../theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * A shimmering rounded rectangle used as a placeholder.
 * Uses a subtle gold/cream pulse on the brand bgElevated color
 * (no third-party gradient lib required).
 */
export function Skeleton({ width, height, radius = 8, style }: SkeletonProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 850,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const backgroundColor = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.bgElevated, COLORS.primaryDim],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as number | undefined,
          height: height as number | undefined,
          borderRadius: radius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

/**
 * Returns true when the given image source is a remote URL (or otherwise
 * an `{ uri }` object) — i.e. NOT a bundled `require(...)` asset.
 * Use this to decide whether to render skeleton placeholders for sibling
 * text content while the image loads.
 */
export function isRemoteImageSource(source: ImageSourcePropType | undefined | null): boolean {
  return (
    !!source &&
    typeof source === 'object' &&
    !Array.isArray(source) &&
    typeof (source as { uri?: unknown }).uri === 'string'
  );
}

interface SkeletonImageProps {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  radius?: number;
  onLoad?: () => void;
  onError?: () => void;
  /** Optional fallback rendered when the image fails to load. */
  fallback?: React.ReactNode;
}

/**
 * Wraps an Image with a shimmering skeleton that fades into the real image
 * once `onLoad` (or `onError`) fires.
 *
 * Local `require(...)` assets (passed as a number/asset id) skip the skeleton
 * entirely — they're already bundled and have no real load time.
 */
export function SkeletonImage({
  source,
  style,
  resizeMode = 'cover',
  radius = 0,
  onLoad,
  onError,
  fallback,
}: SkeletonImageProps) {
  // Detect local bundled asset (require() result):
  //  - native: a number (asset id)
  //  - we treat anything that isn't an object with a string `uri` as local.
  const isRemote =
    !!source &&
    typeof source === 'object' &&
    !Array.isArray(source) &&
    typeof (source as { uri?: unknown }).uri === 'string';

  const [loaded, setLoaded] = useState(!isRemote);
  const [errored, setErrored] = useState(false);
  const fade = useRef(new Animated.Value(isRemote ? 0 : 1)).current;

  const reveal = () => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const handleLoad = () => {
    setLoaded(true);
    reveal();
    onLoad?.();
  };

  const handleError = () => {
    setErrored(true);
    setLoaded(true);
    reveal();
    onError?.();
  };

  return (
    <View style={[styles.wrap, { borderRadius: radius }, style as StyleProp<ViewStyle>]}>
      {!loaded && (
        <Skeleton
          radius={radius}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {errored && fallback ? (
        <View style={StyleSheet.absoluteFillObject}>{fallback}</View>
      ) : (
        <Animated.Image
          source={source}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
          style={[StyleSheet.absoluteFillObject, { opacity: fade, borderRadius: radius }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
});
