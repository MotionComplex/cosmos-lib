import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../constants/theme';

interface MoonVisualProps {
  /** Phase 0-1 (0 = new, 0.5 = full) */
  phase: number;
  size?: number;
}

/**
 * Renders a stylised moon phase using SVG.
 * The illuminated portion is computed from the phase angle.
 */
export function MoonVisual({ phase, size = 120 }: MoonVisualProps) {
  const r = size / 2;
  const cx = r;
  const cy = r;

  // Compute the terminator curve
  // phase: 0=new, 0.25=first quarter, 0.5=full, 0.75=last quarter
  const illumination = phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
  const isWaxing = phase <= 0.5;

  // The "bulge" of the terminator (-r to +r)
  const terminatorX = (1 - illumination * 2) * r;

  // Build the lit path
  // Arc from top to bottom on the lit side, then terminator curve back
  const litSide = isWaxing ? 1 : -1;

  const litPath = [
    `M ${cx} ${cy - r}`,
    // Outer arc (always a semicircle on one side)
    `A ${r} ${r} 0 0 ${isWaxing ? 1 : 0} ${cx} ${cy + r}`,
    // Terminator arc back to top
    `A ${Math.abs(terminatorX)} ${r} 0 0 ${terminatorX * litSide > 0 ? 1 : 0} ${cx} ${cy - r}`,
    'Z',
  ].join(' ');

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Dark side */}
        <Circle cx={cx} cy={cy} r={r - 1} fill="#1a1a2e" stroke={colors.borderLight} strokeWidth={1} />
        {/* Lit side */}
        <Path d={litPath} fill={colors.gold} opacity={0.9} />
        {/* Subtle glow */}
        <Circle cx={cx} cy={cy} r={r - 1} fill="none" stroke={colors.gold} strokeWidth={0.5} opacity={0.3} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
