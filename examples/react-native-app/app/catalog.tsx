import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Data } from "@motioncomplex/cosmos-lib";
import type { CelestialObject, ObjectType } from "@motioncomplex/cosmos-lib";
import { ObjectCard } from "../src/components/ObjectCard";
import { StarField } from "../src/components/StarField";
import { colors, fonts, spacing, radius } from "../src/constants/theme";

const TYPE_FILTERS: { label: string; value: ObjectType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Stars", value: "star" },
  { label: "Planets", value: "planet" },
  { label: "Nebulae", value: "nebula" },
  { label: "Galaxies", value: "galaxy" },
  { label: "Clusters", value: "cluster" },
];

export default function CatalogScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ObjectType | "all">("all");
  const [tierLoading, setTierLoading] = useState(false);
  const [tierLabel, setTierLabel] = useState("Load 9K+ stars");

  const results = useMemo(() => {
    if (query.length > 0) {
      return Data.search(query)
        .filter((o) => filter === "all" || o.type === filter)
        .slice(0, 60);
    }
    const all = filter === "all" ? Data.all() : Data.getByType(filter);
    return all
      .sort((a, b) => (a.magnitude ?? 99) - (b.magnitude ?? 99))
      .slice(0, 60);
  }, [query, filter]);

  const handlePress = useCallback(
    (obj: CelestialObject) => {
      router.push({ pathname: "/detail", params: { id: obj.id } });
    },
    [router],
  );

  return (
    <View style={styles.container}>
      <StarField count={40} />

      {/* Search bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search stars, planets, nebulae…"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* Load more stars (requires cosmos-lib with tier loading support) */}
      {'loadStarTier' in Data && (
        <Pressable
          style={[
            styles.filterChip,
            styles.filterChipActive,
            { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
          ]}
          onPress={async () => {
            setTierLoading(true);
            const n = await (Data as any).loadStarTier(1);
            setTierLabel(`${n.toLocaleString()} stars loaded`);
            setTierLoading(false);
          }}
          disabled={tierLoading}
        >
          <Text style={styles.filterLabelActive}>
            {tierLoading ? "Loading…" : tierLabel}
          </Text>
        </Pressable>
      )}

      {/* Filters */}
      <View style={styles.filterRow}>
        {TYPE_FILTERS.map((f) => (
          <Pressable
            key={f.value}
            onPress={() => setFilter(f.value)}
            style={[
              styles.filterChip,
              filter === f.value && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterLabel,
                filter === f.value && styles.filterLabelActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ObjectCard object={item} onPress={() => handlePress(item)} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No objects found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  searchBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: fonts.size.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  filterLabel: {
    color: colors.textSecondary,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
  },
  filterLabelActive: {
    color: colors.accent,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  empty: {
    color: colors.textMuted,
    fontSize: fonts.size.md,
    textAlign: "center",
    marginTop: spacing.xxl,
  },
});
