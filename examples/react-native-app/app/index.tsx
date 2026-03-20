import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Sun, Moon, Data, AstroMath, Planner } from '@motioncomplex/cosmos-lib';
import { GlassCard } from '../src/components/GlassCard';
import { SectionHeader } from '../src/components/SectionHeader';
import { StarField } from '../src/components/StarField';
import { MoonVisual } from '../src/components/MoonVisual';
import { Badge } from '../src/components/Badge';
import { colors, fonts, spacing, radius } from '../src/constants/theme';

const { width } = Dimensions.get('window');

const PHASE_LABELS: Record<string, string> = {
  'new': 'New Moon',
  'waxing-crescent': 'Waxing Crescent',
  'first-quarter': 'First Quarter',
  'waxing-gibbous': 'Waxing Gibbous',
  'full': 'Full Moon',
  'waning-gibbous': 'Waning Gibbous',
  'last-quarter': 'Last Quarter',
  'waning-crescent': 'Waning Crescent',
};

function formatTime(date: Date | null | undefined): string {
  if (!date) return '--:--';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function TonightScreen() {
  const data = useMemo(() => {
    const now = new Date();
    // Default observer: London
    const observer = { lat: 51.5, lng: -0.12, date: now };

    const sunPos = Sun.position(now);
    const twilight = Sun.twilight(observer);
    const moonPhase = Moon.phase(now);
    const moonPos = Moon.position(now);

    // Bright objects visible tonight — powered by Planner.whatsUp
    const whatsUp = Planner.whatsUp(observer, { minAltitude: 5, magnitudeLimit: 2, limit: 8 });

    // Planets
    const planets = Data.getByType('planet')
      .filter((p) => p.id !== 'earth')
      .map((p) => {
        try {
          const eph = AstroMath.planetEcliptic(p.id as any, now);
          const eq = AstroMath.eclipticToEquatorial(eph, now);
          const hz = AstroMath.equatorialToHorizontal(eq, observer);
          return { ...p, alt: hz.alt, az: hz.az };
        } catch {
          return { ...p, alt: -99, az: 0 };
        }
      })
      .filter((p) => p.alt > -10)
      .sort((a, b) => b.alt - a.alt);

    return { sunPos, twilight, moonPhase, moonPos, whatsUp, planets, now };
  }, []);

  const { twilight, moonPhase, whatsUp, planets, now } = data;

  return (
    <View style={styles.container}>
      <StarField count={80} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Tonight's Sky</Text>
          <Text style={styles.heroDate}>
            {now.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
          <Text style={styles.heroLocation}>London, UK</Text>
        </View>

        {/* Moon Phase Card */}
        <GlassCard accent={colors.gold + '44'}>
          <View style={styles.moonRow}>
            <MoonVisual phase={moonPhase.phase} size={100} />
            <View style={styles.moonInfo}>
              <Text style={styles.moonPhase}>
                {PHASE_LABELS[moonPhase.name] ?? moonPhase.name}
              </Text>
              <Text style={styles.moonIllum}>
                {(moonPhase.illumination * 100).toFixed(0)}% illuminated
              </Text>
              <Text style={styles.moonAge}>
                Day {moonPhase.age.toFixed(1)} of cycle
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Sun Times */}
        <SectionHeader title="Sun" subtitle="Rise & set times" />
        <GlassCard>
          <View style={styles.timesGrid}>
            <TimeBox label="Sunrise" time={formatTime(twilight.sunrise)} color={colors.gold} />
            <TimeBox label="Sunset" time={formatTime(twilight.sunset)} color={colors.rose} />
            <TimeBox
              label="Civil Dawn"
              time={formatTime(twilight.civilDawn)}
              color={colors.cyan}
            />
            <TimeBox
              label="Civil Dusk"
              time={formatTime(twilight.civilDusk)}
              color={colors.accent}
            />
          </View>
        </GlassCard>

        {/* Planets */}
        {planets.length > 0 && (
          <>
            <SectionHeader
              title="Planets"
              subtitle="Current positions from London"
            />
            <View style={styles.planetRow}>
              {planets.map((p) => (
                <View key={p.id} style={styles.planetChip}>
                  <Text style={styles.planetName}>{p.name}</Text>
                  <Text style={styles.planetAlt}>
                    {p.alt > 0 ? `${p.alt.toFixed(0)}° alt` : 'below horizon'}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Bright Objects Up Now — powered by Planner.whatsUp */}
        {whatsUp.length > 0 && (
          <>
            <SectionHeader
              title="Bright Objects Up Now"
              subtitle="Magnitude < 2, above horizon"
            />
            <GlassCard>
              {whatsUp.map((v) => (
                <View key={v.object.id} style={styles.starRow}>
                  <View style={styles.starDot} />
                  <Text style={styles.starName}>{v.object.name}</Text>
                  {v.moonInterference > 0.3 && (
                    <Badge label={`☽ ${(v.moonInterference * 100).toFixed(0)}%`} color={v.moonInterference > 0.5 ? colors.rose : colors.gold} />
                  )}
                  <Text style={styles.starMag}>
                    {v.object.magnitude?.toFixed(1) ?? '—'}m
                  </Text>
                  <Text style={styles.starAlt}>
                    {v.alt.toFixed(0)}° alt
                  </Text>
                </View>
              ))}
            </GlassCard>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function TimeBox({
  label,
  time,
  color,
}: {
  label: string;
  time: string;
  color: string;
}) {
  return (
    <View style={styles.timeBox}>
      <Text style={[styles.timeLabel, { color }]}>{label}</Text>
      <Text style={styles.timeValue}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  hero: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  heroTitle: {
    color: colors.text,
    fontSize: fonts.size.hero,
    fontWeight: fonts.weight.bold,
    letterSpacing: -1,
  },
  heroDate: {
    color: colors.textSecondary,
    fontSize: fonts.size.md,
    marginTop: 4,
  },
  heroLocation: {
    color: colors.textMuted,
    fontSize: fonts.size.sm,
    marginTop: 2,
  },

  // Moon
  moonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  moonInfo: {
    flex: 1,
  },
  moonPhase: {
    color: colors.gold,
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
  },
  moonIllum: {
    color: colors.text,
    fontSize: fonts.size.md,
    marginTop: 4,
  },
  moonAge: {
    color: colors.textSecondary,
    fontSize: fonts.size.sm,
    marginTop: 2,
  },

  // Sun times
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  timeBox: {
    width: (width - spacing.lg * 2 - spacing.lg * 2 - spacing.md) / 2,
  },
  timeLabel: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  timeValue: {
    color: colors.text,
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
  },

  // Planets
  planetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  planetChip: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cyanSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  planetName: {
    color: colors.cyan,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
  },
  planetAlt: {
    color: colors.textSecondary,
    fontSize: fonts.size.xs,
    marginTop: 2,
  },

  // Stars
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  starDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
    marginRight: spacing.sm,
  },
  starName: {
    flex: 1,
    color: colors.text,
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.medium,
  },
  starMag: {
    color: colors.textSecondary,
    fontSize: fonts.size.sm,
    marginRight: spacing.md,
  },
  starAlt: {
    color: colors.textMuted,
    fontSize: fonts.size.sm,
    minWidth: 50,
    textAlign: 'right',
  },
});
