import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '../lib/theme';

export function ListSkeleton() {
  const theme = useAppTheme();
  const opacity = useSharedValue(0.45);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <View style={styles.wrapper}>
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <Animated.View key={item} style={[styles.row, animatedStyle]}>
          <View style={[styles.circle, { backgroundColor: theme.surfaceAlt }]} />
          <View style={styles.lines}>
            <View style={[styles.lineOne, { backgroundColor: theme.surfaceAlt }]} />
            <View style={[styles.lineTwo, { backgroundColor: theme.surfaceAlt }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingTop: 8, paddingHorizontal: 18, gap: 17 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  circle: { width: 54, height: 54, borderRadius: 27 },
  lines: { flex: 1, gap: 10 },
  lineOne: { width: '52%', height: 14, borderRadius: 7 },
  lineTwo: { width: '82%', height: 11, borderRadius: 6 },
});
