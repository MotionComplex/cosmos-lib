import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Data, AstroMath, Units } from '@motioncomplex/cosmos-lib';
import { GlassCard } from '../src/components/GlassCard';
import { Badge } from '../src/components/Badge';
import { StarField } from '../src/components/StarField';
import { colors, fonts, spacing, radius } from '../src/constants/theme';

const TYPE_COLORS: Record<string, string> = {
  star: colors.gold,
  planet: colors.cyan,
  nebula: colors.rose,
  galaxy: colors.accent,
  cluster: colors.emerald,
  'black-hole': '#a855f7',
  moon: '#94a3b8',
};

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const obj = useMemo(() => (id ? Data.get(id) : null), [id]);

  if (!obj) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Object not found</Text>
      </View>
    );
  }

  const typeColor = TYPE_COLORS[obj.type] ?? colors.accent;

  // Compute current horizontal position from London
  const horizonData = useMemo(() => {
    if (obj.ra == null || obj.dec == null) return null;
    const observer = { lat: 51.5, lng: -0.12, date: new Date() };
    const hz = AstroMath.equatorialToHorizontal(
      { ra: obj.ra, dec: obj.dec },
      observer,
    );
    let rts: { rise: Date | null; transit: Date; set: Date | null } | null = null;
    try {
      rts = AstroMath.riseTransitSet({ ra: obj.ra, dec: obj.dec }, observer);
    } catch {
      // Some objects may fail
    }
    return { alt: hz.alt, az: hz.az, rts };
  }, [obj]);

  return (
    <View style={styles.container}>
      <StarField count={50} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{obj.name}</Text>
          <View style={styles.badgeRow}>
            <Badge label={obj.type} color={typeColor} />
            {obj.subtype && (
              <Badge label={obj.subtype} color={colors.textSecondary} />
            )}
          </View>
          {obj.aliases.length > 0 && (
            <Text style={styles.aliases}>
              Also known as: {obj.aliases.join(', ')}
            </Text>
          )}
        </View>

        {/* Description */}
        {obj.description.length > 0 && (
          <GlassCard>
            <Text style={styles.description}>{obj.description}</Text>
          </GlassCard>
        )}

        {/* Coordinates */}
        {obj.ra != null && obj.dec != null && (
          <>
            <Text style={styles.sectionTitle}>Coordinates (J2000)</Text>
            <GlassCard>
              <InfoRow
                label="Right Ascension"
                value={Units.raToHms(obj.ra)}
              />
              <InfoRow
                label="Declination"
                value={Units.decToDms(obj.dec)}
              />
              {obj.magnitude != null && (
                <InfoRow
                  label="Apparent Magnitude"
                  value={obj.magnitude.toFixed(2)}
                />
              )}
              {obj.spectral && (
                <InfoRow label="Spectral Type" value={obj.spectral} />
              )}
            </GlassCard>
          </>
        )}

        {/* Physical Properties */}
        {(obj.diameter_km || obj.mass_kg || obj.distance || obj.size_arcmin) && (
          <>
            <Text style={styles.sectionTitle}>Physical Properties</Text>
            <GlassCard>
              {obj.distance && (
                <InfoRow
                  label="Distance"
                  value={`${obj.distance.value.toLocaleString()} ${obj.distance.unit}`}
                />
              )}
              {obj.diameter_km && (
                <InfoRow
                  label="Diameter"
                  value={`${obj.diameter_km.toLocaleString()} km`}
                />
              )}
              {obj.mass_kg && (
                <InfoRow
                  label="Mass"
                  value={`${obj.mass_kg.toExponential(2)} kg`}
                />
              )}
              {obj.size_arcmin && (
                <InfoRow
                  label="Angular Size"
                  value={`${obj.size_arcmin.toFixed(1)} arcmin`}
                />
              )}
              {obj.surface_temp_K && (
                <InfoRow
                  label="Surface Temp"
                  value={`${obj.surface_temp_K.toLocaleString()} K`}
                />
              )}
              {obj.moons != null && (
                <InfoRow label="Known Moons" value={String(obj.moons)} />
              )}
            </GlassCard>
          </>
        )}

        {/* Current Sky Position */}
        {horizonData && (
          <>
            <Text style={styles.sectionTitle}>Current Position (London)</Text>
            <GlassCard
              accent={
                horizonData.alt > 0 ? colors.emerald + '44' : colors.rose + '44'
              }
            >
              <InfoRow
                label="Altitude"
                value={`${horizonData.alt.toFixed(1)}°`}
              />
              <InfoRow
                label="Azimuth"
                value={`${horizonData.az.toFixed(1)}°`}
              />
              <InfoRow
                label="Status"
                value={horizonData.alt > 0 ? 'Above Horizon' : 'Below Horizon'}
              />
              {horizonData.rts?.rise && (
                <InfoRow
                  label="Rise"
                  value={horizonData.rts.rise.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                />
              )}
              {horizonData.rts?.set && (
                <InfoRow
                  label="Set"
                  value={horizonData.rts.set.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                />
              )}
            </GlassCard>
          </>
        )}

        {/* Tags */}
        {obj.tags.length > 0 && (
          <View style={styles.tagRow}>
            {obj.tags.map((t) => (
              <Badge key={t} label={t} color={colors.textSecondary} />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
  },
  empty: {
    color: colors.textMuted,
    fontSize: fonts.size.lg,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    marginBottom: spacing.lg,
  },
  name: {
    color: colors.text,
    fontSize: fonts.size.hero,
    fontWeight: fonts.weight.bold,
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  aliases: {
    color: colors.textSecondary,
    fontSize: fonts.size.sm,
    fontStyle: 'italic',
  },
  description: {
    color: colors.text,
    fontSize: fonts.size.md,
    lineHeight: 22,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: fonts.size.sm,
  },
  infoValue: {
    color: colors.text,
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.semibold,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
