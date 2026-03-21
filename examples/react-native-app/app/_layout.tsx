import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { colors, fonts } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: fonts.weight.semibold },
          tabBarStyle: {
            backgroundColor: colors.bg,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingTop: 4,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Tonight',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="moon-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="catalog"
          options={{
            title: 'Catalog',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="telescope-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: 'Events',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="apod"
          options={{
            title: 'APOD',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="image-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="detail"
          options={{
            href: null, // hidden from tab bar
            title: 'Details',
          }}
        />
      </Tabs>
    </>
  );
}
