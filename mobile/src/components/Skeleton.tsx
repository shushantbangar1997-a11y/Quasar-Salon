import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  ImageSourcePropType,
} from 'react-native';
import { Image, ImageContentFit } from 'expo-image';
import { COLORS } from '../theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * A shimmering rounded rectangle used as a placeholder.
 * Uses a subtle gold/cream pulse on the brand bgElevated color.
 */
export function Skeleton({ width, height, radius = 8, style }: SkeletonProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 850, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 850, useNativeDriver: false }),
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
 * Returns true when the given image source is a remote URL (i.e. not a
 * bundled `require(...)` asset). Use this to decide whether to render
 * skeleton bars for sibling text content while the image loads.
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
  style?: StyleProp<ViewStyle>;
  resizeMode?: ImageContentFit;
  radius?: number;
  onLoad?: () => void;
  onError?: () => void;
  /** Optional node rendered when the image fails to load. */
  fallback?: React.ReactNode;
}

/**
 * Renders an image that shows a soft placeholder colour while loading,
 * then smoothly crossfades into the real image once it arrives.
 *
 * Backed by expo-image which provides memory + disk caching, so images
 * load from cache instantly on every subsequent render.
 *
 * If the image fails to load and a `fallback` node is provided, the
 * fallback is shown in place of the broken image.
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
  const [errored, setErrored] = useState(false);

  const handleError = () => {
    setErrored(true);
    onError?.();
  };

  return (
    <View style={[s.wrap, { borderRadius: radius }, style]}>
      {errored && fallback ? (
        <View style={StyleSheet.absoluteFillObject}>{fallback}</View>
      ) : (
        <Image
          source={source}
          contentFit={resizeMode}
          style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
          transition={300}
          cachePolicy="memory-disk"
          placeholder={COLORS.bgElevated}
          onLoad={() => onLoad?.()}
          onError={handleError}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: COLORS.bgElevated,
  },
});
