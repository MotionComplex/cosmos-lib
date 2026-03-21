import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { GlassCard } from '../src/components/GlassCard';
import { SectionHeader } from '../src/components/SectionHeader';
import { StarField } from '../src/components/StarField';
import { Badge } from '../src/components/Badge';
import { colors, fonts, spacing, radius } from '../src/constants/theme';

import * as cosmosLib from '@motioncomplex/cosmos-lib';
const Equipment = 'Equipment' in cosmosLib ? (cosmosLib as any).Equipment : null;
const AstroPhoto = 'AstroPhoto' in cosmosLib ? (cosmosLib as any).AstroPhoto : null;

const observer = { lat: 51.5, lng: -0.12, date: new Date() };
const DEFAULT_TARGETS = ['m31', 'm42', 'm45', 'm27', 'm57'];

export default function AstroPhotoScreen() {
  if (!Equipment || !AstroPhoto) {
    return (
      <View style={styles.container}>
        <StarField count={40} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Requires cosmos-lib with Equipment support.</Text>
        </View>
      </View>
    );
  }

  const rig = useMemo(() => {
    try {
      return Equipment.rig({ camera: 'Sony A7 III', telescope: 'Sky-Watcher Esprit 100ED' });
    } catch { return null; }
  }, []);

  const data = useMemo(() => {
    const mw = AstroPhoto.milkyWay(observer);
    const pa = AstroPhoto.polarAlignment(observer);
    const plan = AstroPhoto.sessionPlan(observer, DEFAULT_TARGETS);
    const mwSeason = AstroPhoto.milkyWaySeason(observer);
    return { mw, pa, plan, mwSeason };
  }, []);

  const fov = rig?.fov();

  return (
    <View style={styles.container}>
      <StarField count={60} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <SectionHeader title="My Rig" subtitle="Sony A7 III + Esprit 100ED" />
        {rig && fov && (
          <GlassCard>
            <View style={styles.statsRow}>
              <StatBox label="FOV" value={`${fov.width.toFixed(1)}° × ${fov.height.toFixed(1)}°`} color={colors.cyan} />
              <StatBox label="Pixel Scale" value={`${rig.pixelScale().toFixed(2)}"/px`} color={colors.accent} />
              <StatBox label="Max Exp" value={`${rig.maxExposure()}s`} color={colors.gold} />
            </View>
          </GlassCard>
        )}

        <SectionHeader title="Session Plan" subtitle="Best targets tonight" />
        {data.plan.map((t: any, i: number) => (
          <GlassCard key={t.objectId}>
            <View style={styles.planRow}>
              <Text style={styles.planIndex}>#{i + 1}</Text>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{t.name}</Text>
                <Text style={styles.planMeta}>
                  {t.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {t.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {' · '}Peak {t.peakAltitude.toFixed(0)}° · Moon {t.moonSeparation}°
                </Text>
              </View>
              <Badge
                label={`${t.score}`}
                color={t.score > 70 ? colors.emerald : t.score > 40 ? colors.gold : colors.rose}
              />
            </View>
          </GlassCard>
        ))}

        <SectionHeader title="Milky Way Core" subtitle={data.mw.aboveHorizon ? 'Above horizon' : 'Below horizon'} />
        <GlassCard accent={colors.accent + '33'}>
          <View style={styles.statsRow}>
            <StatBox label="Altitude" value={`${data.mw.altitude.toFixed(1)}°`} color={data.mw.aboveHorizon ? colors.emerald : colors.rose} />
            <StatBox label="Transit" value={data.mw.transit.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} color={colors.accent} />
            <StatBox label="Season" value={`${data.mwSeason.length} months`} color={colors.gold} />
          </View>
        </GlassCard>

        <SectionHeader title="Polar Alignment" subtitle={data.pa.hemisphere === 'north' ? 'Polaris' : 'Sigma Octantis'} />
        <GlassCard>
          <View style={styles.statsRow}>
            <StatBox label="Offset" value={`${data.pa.polarisOffset.toFixed(3)}°`} color={colors.cyan} />
            <StatBox label="PA" value={`${data.pa.positionAngle.toFixed(1)}°`} color={colors.accent} />
            <StatBox label="Altitude" value={`${data.pa.polarisAltitude.toFixed(1)}°`} color={colors.gold} />
          </View>
        </GlassCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingTop: spacing.md },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyText: { color: colors.textMuted, fontSize: fonts.size.md, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statBox: { flex: 1 },
  statLabel: { fontSize: fonts.size.xs, fontWeight: fonts.weight.semibold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  statValue: { color: colors.text, fontSize: fonts.size.xl, fontWeight: fonts.weight.bold },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  planIndex: { color: colors.textMuted, fontSize: fonts.size.xl, fontWeight: fonts.weight.bold, width: 30 },
  planInfo: { flex: 1 },
  planName: { color: colors.text, fontSize: fonts.size.md, fontWeight: fonts.weight.semibold, marginBottom: 2 },
  planMeta: { color: colors.textSecondary, fontSize: fonts.size.xs },
});
