import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated,
  Dimensions, Platform, PanResponder,
} from 'react-native';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLORS, RADIUS, SHADOW } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');
const PILL_W = Math.min(SCREEN_W - 40, 340);
const TAB_W = PILL_W / 4;
const INDICATOR_W = TAB_W - 10;
const INDICATOR_H = 42;
const HIDE_DIST = 120;

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12L12 3L21 12" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 10V20H9.5V15.5H14.5V20H19V10" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SearchIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={10.5} cy={10.5} r={6.5} stroke={color} strokeWidth={1.8} />
      <Line x1={15.5} y1={15.5} x2={21} y2={21} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function BookingsIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={18} rx={2} stroke={color} strokeWidth={1.8} />
      <Line x1={3} y1={9} x2={21} y2={9} stroke={color} strokeWidth={1.8} />
      <Line x1={8} y1={2} x2={8} y2={6} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={16} y1={2} x2={16} y2={6} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
      <Path d="M4 21C4 17.134 7.582 14 12 14C16.418 14 20 17.134 20 21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

const TAB_ICONS = [HomeIcon, SearchIcon, BookingsIcon, ProfileIcon];
const TAB_LABELS = ['Home', 'Search', 'Bookings', 'Profile'];

export default function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const indicatorX    = useRef(new Animated.Value(state.index * TAB_W + 5)).current;
  const tooltipOpacity = useRef(new Animated.Value(1)).current;
  const tooltipY      = useRef(new Animated.Value(0)).current;
  const barY          = useRef(new Animated.Value(0)).current;
  const prevIndex     = useRef(state.index);
  const [hidden, setHidden] = useState(false);
  const isHiddenRef   = useRef(false);

  const hideBar = () => {
    Animated.spring(barY, {
      toValue: HIDE_DIST,
      useNativeDriver: true,
      tension: 120,
      friction: 14,
    }).start(() => {
      isHiddenRef.current = true;
      setHidden(true);
    });
  };

  const showBar = () => {
    isHiddenRef.current = false;
    setHidden(false);
    Animated.spring(barY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 180,
      friction: 18,
    }).start();
  };

  /* ── Drag-down-to-hide gesture on the pill ── */
  const dragPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) barY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 40 || g.vy > 0.6) {
          hideBar();
        } else {
          Animated.spring(barY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 180,
            friction: 18,
          }).start();
        }
      },
    })
  ).current;

  /* ── Swipe-up-from-bottom-edge gesture (when hidden) ── */
  const edgePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) =>
        g.dy < -8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderRelease: (_, g) => {
        if (g.dy < -20 || g.vy < -0.4) showBar();
      },
    })
  ).current;

  useEffect(() => {
    Animated.spring(indicatorX, {
      toValue: state.index * TAB_W + 5,
      useNativeDriver: true,
      tension: 200,
      friction: 20,
    }).start();

    if (prevIndex.current !== state.index) {
      tooltipOpacity.setValue(0);
      tooltipY.setValue(6);
      Animated.parallel([
        Animated.timing(tooltipOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(tooltipY, {
          toValue: 0,
          tension: 280,
          friction: 22,
          useNativeDriver: true,
        }),
      ]).start();
      prevIndex.current = state.index;
    }
  }, [state.index]);

  const handlePress = (index: number, routeName: string) => {
    const event = navigation.emit({ type: 'tabPress', target: state.routes[index].key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(routeName);
  };

  const activeLabel = TAB_LABELS[state.index];
  const PILL_LEFT = (SCREEN_W - PILL_W) / 2;
  const tooltipLeftOffset = PILL_LEFT + state.index * TAB_W + TAB_W / 2 - 36;

  return (
    <View style={s.wrapper} pointerEvents="box-none">
      {/* Floating tooltip label */}
      {!hidden && (
        <Animated.View
          pointerEvents="none"
          style={[
            s.tooltip,
            {
              opacity: tooltipOpacity,
              transform: [{ translateY: tooltipY }],
              left: tooltipLeftOffset,
            },
          ]}
        >
          <Text style={s.tooltipText}>{activeLabel}</Text>
        </Animated.View>
      )}

      {/* Pill container – drag down to hide */}
      <Animated.View
        style={[s.pillWrap, { transform: [{ translateY: barY }] }]}
        {...dragPan.panHandlers}
      >
        {/* Pull-handle hint */}
        <View style={s.handle} pointerEvents="none" />

        <View style={s.pill}>
          {/* Sliding active indicator */}
          <Animated.View
            style={[s.indicator, { transform: [{ translateX: indicatorX }] }]}
          />

          {/* Tab buttons */}
          {state.routes.map((route, index) => {
            const isActive = state.index === index;
            const IconComponent = TAB_ICONS[index];
            const color = isActive ? COLORS.primary : COLORS.textMuted;

            return (
              <Pressable
                key={route.key}
                style={s.tab}
                onPress={() => handlePress(index, route.name)}
                android_ripple={{ color: COLORS.primaryDim, borderless: true, radius: 24 }}
              >
                <Animated.View style={{ transform: [{ scale: isActive ? 1.1 : 1 }] }}>
                  <IconComponent color={color} />
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* Bottom edge swipe zone – only visible/active when bar is hidden */}
      {hidden && (
        <View style={s.edgeZone} {...edgePan.panHandlers}>
          <View style={s.edgePeek} />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none' as any,
  },
  tooltip: {
    position: 'absolute',
    bottom: 70,
    minWidth: 72,
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.card,
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  pillWrap: {
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: 5,
  },
  pill: {
    width: PILL_W,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: (58 - INDICATOR_H) / 2,
    width: INDICATOR_W,
    height: INDICATOR_H,
    backgroundColor: COLORS.primaryDim,
    borderRadius: 22,
  },
  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  edgeZone: {
    position: 'absolute',
    bottom: -(Platform.OS === 'ios' ? 28 : 20),
    left: 0,
    right: 0,
    height: 48,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  edgePeek: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.5,
  },
});
