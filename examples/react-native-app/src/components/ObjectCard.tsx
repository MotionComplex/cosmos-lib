import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { Badge } from './Badge';
import type { CelestialObject } from '@motioncomplex/cosmos-lib';

const TYPE_COLORS: Record<string, string> = {
  star: colors.gold,
  planet: colors.cyan,
  nebula: colors.rose,
  galaxy: colors.accent,
  cluster: colors.emerald,
  'black-hole': '#a855f7',
  moon: '#94a3b8',
};

const TYPE_ICONS: Record<string, string> = {
  star: '\u2B50',
  planet: '\uD83E\uDE90',
  nebula: '\uD83C\uDF0C',
  galaxy: '\uD83C\uDF00',
  cluster: '\u2728',
  'black-hole': '\u26AB',
  moon: '\uD83C\uDF19',
};

interface ObjectCardProps {
  object: CelestialObject;
  onPress?: () => void;
}

export function ObjectCard({ object, onPress }: ObjectCardProps) {
  const typeColor = TYPE_COLORS[object.type] ?? colors.accent;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.iconCircle, { borderColor: typeColor }]}>
        <Text style={styles.icon}>{TYPE_ICONS[object.type] ?? '\u2B50'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {object.name}
        </Text>
        <View style={styles.metaRow}>
          <Badge label={object.type} color={typeColor} />
          {object.magnitude != null && (
            <Text style={styles.mag}>mag {object.magnitude.toFixed(1)}</Text>
          )}
        </View>
      </View>
      <Text style={styles.chevron}>{'\u203A'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  pressed: {
    backgroundColor: colors.bgCardHover,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.semibold,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mag: {
    color: colors.textSecondary,
    fontSize: fonts.size.xs,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 24,
    marginLeft: spacing.sm,
  },
});
