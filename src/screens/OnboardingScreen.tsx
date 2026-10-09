import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { HeroArt } from '../components/HeroArt';
import { PageDots } from '../components/PageDots';
import { Screen } from '../components/Screen';
import type { IconName } from '../constants/activities';
import { useAppDispatch } from '../store/hooks';
import { completeOnboarding } from '../store/slices/settingsSlice';
import { useTheme } from '../theme';

interface Page {
  key: string;
  title: string;
  body: string;
  icon: IconName;
  badge: IconName;
}

const PAGES: Page[] = [
  {
    key: 'focus',
    title: 'Stay Focused\nGet More Done',
    body: 'Work for 25 minutes,\ntake a 5 minute break,\nfeel refreshed.',
    icon: 'timer-outline',
    badge: 'laptop-outline',
  },
  {
    key: 'breaks',
    title: 'Healthy Breaks\nHappy You',
    body: 'Simple activities to relax\nyour mind and body.',
    icon: 'body-outline',
    badge: 'heart-outline',
  },
];

const LAST = PAGES.length - 1;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * The pager is driven by touch gestures (PanResponder) + an Animated value instead of a
 * native horizontal ScrollView, so swiping behaves the same on Android (Expo Go) and iOS.
 */
export default function OnboardingScreen() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();

  // `pos` is the pager position in "pages" (0 = first page, 1 = second, fractions while dragging).
  const pos = useRef(new Animated.Value(0)).current;
  const posRef = useRef(0);
  const startRef = useRef(0);
  const widthRef = useRef(width);
  widthRef.current = width;

  const [index, setIndex] = useState(0);
  const last = index === LAST;

  useEffect(() => {
    const id = pos.addListener(({ value }) => {
      posRef.current = value;
      const nearest = clamp(Math.round(value), 0, LAST);
      setIndex((prev) => (prev === nearest ? prev : nearest));
    });
    return () => pos.removeListener(id);
  }, [pos]);

  const goTo = useCallback(
    (target: number) => {
      Animated.timing(pos, {
        toValue: clamp(target, 0, LAST),
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    },
    [pos],
  );

  const pan = useRef(
    PanResponder.create({
      // Only claim clearly horizontal drags.
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
      onPanResponderGrant: () => {
        pos.stopAnimation();
        startRef.current = posRef.current;
      },
      onPanResponderMove: (_, g) => {
        pos.setValue(clamp(startRef.current - g.dx / widthRef.current, 0, LAST));
      },
      onPanResponderRelease: (_, g) => {
        const w = widthRef.current;
        const base = Math.round(startRef.current);
        let target = base;
        if (g.dx < -w * 0.2 || g.vx < -0.5) target = base + 1; // swipe left -> next
        else if (g.dx > w * 0.2 || g.vx > 0.5) target = base - 1; // swipe right -> previous
        goTo(target);
      },
      onPanResponderTerminate: () => goTo(Math.round(posRef.current)),
    }),
  ).current;

  const next = () => {
    if (last) dispatch(completeOnboarding());
    else goTo(Math.round(posRef.current) + 1);
  };

  const translateX = pos.interpolate({
    inputRange: [0, LAST],
    outputRange: [0, -LAST * width],
  });

  return (
    <Screen padded={false}>
      <View style={styles.pager} {...pan.panHandlers} testID="onboarding-pager">
        <Animated.View style={[styles.row, { width: width * PAGES.length, transform: [{ translateX }] }]}>
          {PAGES.map((item) => (
            <View key={item.key} style={[styles.page, { width }]}>
              <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.body, { color: colors.textMuted }]}>{item.body}</Text>
              <View style={styles.art}>
                <HeroArt icon={item.icon} badge={item.badge} size={250} />
              </View>
            </View>
          ))}
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <PageDots count={PAGES.length} index={index} />
        <Button
          title={last ? 'Get Started' : 'Next'}
          trailingIcon="arrow-forward"
          onPress={next}
          style={styles.cta}
          testID="onboarding-next"
        />
        {!last ? (
          <Button title="Skip" variant="ghost" onPress={() => dispatch(completeOnboarding())} />
        ) : (
          <View style={{ height: 50 }} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pager: { flex: 1, overflow: 'hidden' },
  row: { flex: 1, flexDirection: 'row' },
  page: { paddingHorizontal: 32, paddingTop: 48 },
  title: { fontSize: 30, fontWeight: '800', lineHeight: 38 },
  body: { fontSize: 16, lineHeight: 24, marginTop: 14 },
  art: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  footer: { paddingHorizontal: 32, paddingBottom: 12, gap: 16 },
  cta: { alignSelf: 'stretch' },
});
