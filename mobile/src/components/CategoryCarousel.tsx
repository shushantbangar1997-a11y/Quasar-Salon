import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable,
  Animated, StyleSheet, Dimensions,
} from 'react-native';
import { COLORS, RADIUS } from '../theme';
import { QuasarCategory } from '../quasarData';
import { SkeletonImage, isRemoteImageSource } from './Skeleton';

const { width: SW } = Dimensions.get('window');
const CARD_W = SW - 40;
const CARD_H = 210;
const THUMB_ACTIVE = 88;
const THUMB_INACTIVE = 28;
const THUMB_H = 54;
const THUMB_GAP = 4;

interface Props {
  categories: QuasarCategory[];
  onSelect: (cat: QuasarCategory) => void;
}

export default function CategoryCarousel({ categories, onSelect }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const mainRef = useRef<ScrollView>(null);
  const thumbRef = useRef<ScrollView>(null);

  const widths = useRef(
    categories.map((_, i) =>
      new Animated.Value(i === 0 ? THUMB_ACTIVE : THUMB_INACTIVE)
    )
  ).current;

  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= categories.length) return;
      if (idx === activeIdx) {
        onSelect(categories[idx]);
        return;
      }

      Animated.parallel([
        Animated.spring(widths[activeIdx], {
          toValue: THUMB_INACTIVE,
          useNativeDriver: false,
          stiffness: 260,
          damping: 22,
        }),
        Animated.spring(widths[idx], {
          toValue: THUMB_ACTIVE,
          useNativeDriver: false,
          stiffness: 260,
          damping: 22,
        }),
      ]).start();

      setActiveIdx(idx);

      mainRef.current?.scrollTo({ x: idx * (CARD_W + 12), animated: true });

      const thumbScrollX = Math.max(
        0,
        idx * (THUMB_INACTIVE + THUMB_GAP) - SW / 2 + THUMB_ACTIVE / 2
      );
      thumbRef.current?.scrollTo({ x: thumbScrollX, animated: true });
    },
    [activeIdx, categories, onSelect, widths]
  );

  const onMainScrollEnd = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / (CARD_W + 12));
    if (idx !== activeIdx) goTo(idx);
  };

  return (
    <View style={s.root}>
      {/* ─── Main slide strip ─────────────────────────────────── */}
      <ScrollView
        ref={mainRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + 12}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        onMomentumScrollEnd={onMainScrollEnd}
        scrollEventThrottle={16}
      >
        {categories.map((cat, i) => (
          <CarouselSlide
            key={cat.id}
            cat={cat}
            onPress={() => i === activeIdx ? onSelect(cat) : goTo(i)}
          />
        ))}
      </ScrollView>

      {/* ─── Dot / index indicator ────────────────────────────── */}
      <View style={s.dotsRow}>
        {categories.map((_, i) => (
          <View
            key={i}
            style={[s.dot, i === activeIdx && s.dotActive]}
          />
        ))}
      </View>

      {/* ─── Thumbnail strip ──────────────────────────────────── */}
      <ScrollView
        ref={thumbRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.thumbContent}
        style={s.thumbScroll}
      >
        {categories.map((cat, i) => {
          const isActive = i === activeIdx;
          return (
            <Animated.View
              key={cat.id}
              style={[s.thumb, { width: widths[i] }]}
            >
              <Pressable style={s.thumbPressable} onPress={() => goTo(i)}>
                <SkeletonImage
                  source={
                    typeof cat.imageUrl === 'string'
                      ? { uri: cat.imageUrl }
                      : cat.imageUrl
                  }
                  style={s.thumbImg}
                  resizeMode="cover"
                  radius={RADIUS.md}
                  fallback={
                    <View style={s.thumbFallback}>
                      <Text style={s.thumbFallbackIcon}>{cat.icon}</Text>
                    </View>
                  }
                />
                {isActive && <View style={s.thumbActiveBar} />}
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function CarouselSlide({
  cat,
  onPress,
}: {
  cat: QuasarCategory;
  onPress: () => void;
}) {
  const source =
    typeof cat.imageUrl === 'string' ? { uri: cat.imageUrl } : cat.imageUrl;
  const remote = isRemoteImageSource(source);
  const [ready, setReady] = useState(!remote);

  return (
    <Pressable style={s.slide} onPress={onPress}>
      <SkeletonImage
        source={source}
        style={s.slideImg}
        resizeMode="cover"
        radius={RADIUS.xl}
        onLoad={() => setReady(true)}
        onError={() => setReady(true)}
        fallback={
          <View style={s.slideFallback}>
            <Text style={s.slideFallbackIcon}>{cat.icon}</Text>
          </View>
        }
      />
      {/* Gold gradient overlay at bottom — only after image is ready */}
      {ready && (
        <View style={s.slideOverlay}>
          <View style={s.overlayContent}>
            <Text style={s.catIcon}>{cat.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.catName}>{cat.name}</Text>
              <Text style={s.catCount}>{cat.services.length} services</Text>
            </View>
            <View style={s.tapBadge}>
              <Text style={s.tapBadgeText}>View →</Text>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { marginTop: 8 },

  slide: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.bgElevated,
  },
  slideImg: {
    width: '100%',
    height: '100%',
  },
  slideFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgElevated,
  },
  slideFallbackIcon: {
    fontSize: 56,
    opacity: 0.6,
  },
  slideOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 32,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  overlayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catIcon: { fontSize: 22 },
  catName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  catCount: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  tapBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  tapBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: 10,
    marginBottom: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: COLORS.primary,
  },

  thumbScroll: { marginTop: 2 },
  thumbContent: {
    paddingHorizontal: 20,
    gap: THUMB_GAP,
    alignItems: 'center',
    paddingVertical: 6,
  },
  thumb: {
    height: THUMB_H,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.bgElevated,
  },
  thumbPressable: { flex: 1 },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  thumbFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgElevated,
  },
  thumbFallbackIcon: {
    fontSize: 18,
    opacity: 0.7,
  },
  thumbActiveBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
  },
});
