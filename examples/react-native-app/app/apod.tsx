import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Linking,
} from 'react-native';
import { NASA } from '@motioncomplex/cosmos-lib';
import type { APODResult } from '@motioncomplex/cosmos-lib';
import { GlassCard } from '../src/components/GlassCard';
import { StarField } from '../src/components/StarField';
import { Badge } from '../src/components/Badge';
import { colors, fonts, spacing, radius } from '../src/constants/theme';

export default function APODScreen() {
  const [apod, setApod] = useState<APODResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // NASA APOD — uses DEMO_KEY by default
        const result = await NASA.apod();
        if (!cancelled) setApod(result);
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? 'Failed to load APOD');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={styles.container}>
      <StarField count={40} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Astronomy Picture{'\n'}of the Day</Text>
        <Text style={styles.subtitle}>Powered by NASA API</Text>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Fetching today's image…</Text>
          </View>
        )}

        {error && (
          <GlassCard accent={colors.rose + '44'}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>
              The NASA APOD API requires a network connection. You can get a
              free API key at api.nasa.gov and pass it via NASA.configure().
            </Text>
          </GlassCard>
        )}

        {apod && (
          <>
            {/* Image */}
            {apod.media_type === 'image' && apod.url && (
              <Pressable
                onPress={() => apod.hdurl && Linking.openURL(apod.hdurl)}
              >
                <Image
                  source={{ uri: apod.url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </Pressable>
            )}

            {/* Video placeholder */}
            {apod.media_type === 'video' && (
              <Pressable
                onPress={() => apod.url && Linking.openURL(apod.url)}
                style={styles.videoPlaceholder}
              >
                <Text style={styles.videoIcon}>{'\u25B6'}</Text>
                <Text style={styles.videoText}>Tap to watch video</Text>
              </Pressable>
            )}

            {/* Info */}
            <View style={styles.apodHeader}>
              <Text style={styles.apodTitle}>{apod.title}</Text>
              <View style={styles.metaRow}>
                <Badge label={apod.date} color={colors.accent} />
                {apod.copyright && (
                  <Text style={styles.copyright}>
                    {'\u00A9'} {apod.copyright}
                  </Text>
                )}
              </View>
            </View>

            <GlassCard>
              <Text style={styles.explanation}>{apod.explanation}</Text>
            </GlassCard>
          </>
        )}

        {/* Search section — showcase NASA.searchImages */}
        <Text style={styles.sectionTitle}>Explore NASA Images</Text>
        <NASAImageGrid />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function NASAImageGrid() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await NASA.searchImages('nebula', { pageSize: 6 });
        if (!cancelled) setImages(result.items);
      } catch {
        // Silently handle — network may not be available
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />;
  }

  if (images.length === 0) {
    return (
      <Text style={styles2.empty}>
        Could not load images. Check your network connection.
      </Text>
    );
  }

  return (
    <View style={styles2.grid}>
      {images.map((img, i) => (
        <Pressable
          key={i}
          onPress={() => img.url && Linking.openURL(img.url)}
          style={styles2.gridItem}
        >
          {img.thumbnail && (
            <Image
              source={{ uri: img.thumbnail }}
              style={styles2.gridImage}
              resizeMode="cover"
            />
          )}
          <Text style={styles2.gridTitle} numberOfLines={2}>
            {img.title}
          </Text>
        </Pressable>
      ))}
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
  title: {
    color: colors.text,
    fontSize: fonts.size.hero,
    fontWeight: fonts.weight.bold,
    letterSpacing: -1,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fonts.size.sm,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  center: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fonts.size.sm,
    marginTop: spacing.md,
  },
  errorText: {
    color: colors.rose,
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.semibold,
    marginBottom: spacing.sm,
  },
  errorHint: {
    color: colors.textSecondary,
    fontSize: fonts.size.sm,
    lineHeight: 20,
  },
  image: {
    width: '100%',
    height: 260,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  videoIcon: {
    color: colors.accent,
    fontSize: 40,
  },
  videoText: {
    color: colors.textSecondary,
    fontSize: fonts.size.sm,
    marginTop: spacing.sm,
  },
  apodHeader: {
    marginBottom: spacing.md,
  },
  apodTitle: {
    color: colors.text,
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  copyright: {
    color: colors.textMuted,
    fontSize: fonts.size.xs,
  },
  explanation: {
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
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
});

const styles2 = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridItem: {
    width: '48%' as any,
    marginBottom: spacing.sm,
  },
  gridImage: {
    width: '100%',
    height: 120,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  gridTitle: {
    color: colors.textSecondary,
    fontSize: fonts.size.xs,
  },
  empty: {
    color: colors.textMuted,
    fontSize: fonts.size.sm,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
