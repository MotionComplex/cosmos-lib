import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fonts } from '../constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
}

export function Badge({ label, color = colors.accent, bg }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bg ?? `${color}22` }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
