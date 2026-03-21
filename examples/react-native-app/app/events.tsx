import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { GlassCard } from '../src/components/GlassCard';
import { Badge } from '../src/components/Badge';
import { StarField } from '../src/components/StarField';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, fonts, spacing, radius } from '../src/constants/theme';

// Use runtime check since the published version may not have Events yet
import * as cosmosLib from '@motioncomplex/cosmos-lib';
const Events = 'Events' in cosmosLib ? (cosmosLib as any).Events : null;

const CATEGORY_COLORS: Record<string, string> = {
  'moon-phase': '#94a3b8',
  'eclipse': colors.gold,
  'meteor-shower': colors.emerald,
  'opposition': colors.rose,
  'conjunction': colors.cyan,
  'elongation': colors.accent,
  'equinox': colors.gold,
  'solstice': '#fb923c',
};

interface AstroEvent {
  category: string;
  title: string;
  date: Date;
  detail?: string;
}

export default function EventsScreen() {
  const events: AstroEvent[] = useMemo(() => {
    if (!Events) return [];
    return Events.nextEvents(
      { lat: 51.5, lng: -0.12, date: new Date() },
      { days: 180, limit: 30 },
    );
  }, []);

  if (!Events) {
    return (
      <View style={styles.container}>
        <StarField count={40} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Events module requires cosmos-lib with Events support.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StarField count={40} />
      <FlatList
        data={events}
        keyExtractor={(item, i) => `${item.category}-${item.date.valueOf()}-${i}`}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <SectionHeader
            title="Upcoming Events"
            subtitle={`${events.length} events in the next 6 months`}
          />
        }
        renderItem={({ item }) => (
          <GlassCard>
            <View style={styles.eventRow}>
              <View style={styles.dateCol}>
                <Text style={styles.dateDay}>
                  {item.date.getDate()}
                </Text>
                <Text style={styles.dateMonth}>
                  {item.date.toLocaleDateString(undefined, { month: 'short' })}
                </Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <View style={styles.eventMeta}>
                  <Badge
                    label={item.category}
                    color={CATEGORY_COLORS[item.category] ?? colors.accent}
                  />
                  {item.detail && (
                    <Text style={styles.eventDetail} numberOfLines={1}>
                      {item.detail}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </GlassCard>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No upcoming events</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fonts.size.md,
    textAlign: 'center',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dateCol: {
    width: 44,
    alignItems: 'center',
  },
  dateDay: {
    color: colors.text,
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
  },
  dateMonth: {
    color: colors.textSecondary,
    fontSize: fonts.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    color: colors.text,
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.semibold,
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  eventDetail: {
    color: colors.textMuted,
    fontSize: fonts.size.xs,
    flex: 1,
  },
});
