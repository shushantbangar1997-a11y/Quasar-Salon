import React from 'react';
import Svg, { Path, Circle, Text as SvgText, G, Defs, ClipPath, Rect } from 'react-native-svg';

interface QuasarLogoSvgProps {
  width?: number;
  height?: number;
  color?: string;
  showText?: boolean;
}

export default function QuasarLogoSvg({
  width = 110,
  height = 140,
  color = '#C9A84C',
  showText = true,
}: QuasarLogoSvgProps) {
  const viewBoxWidth = 220;
  const viewBoxHeight = showText ? 290 : 260;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
    >
      {/* ── Crown ── */}
      <Path
        d="M 28 70 L 28 44 L 60 60 L 90 18 L 110 6 L 130 18 L 160 60 L 192 44 L 192 70 Q 151 63 110 63 Q 69 63 28 70 Z"
        fill={color}
      />
      {/* Crown center sparkle (4-point star) */}
      <Path
        d="M 110 0 L 113 5 L 120 6 L 113 7 L 110 14 L 107 7 L 100 6 L 107 5 Z"
        fill={color}
      />

      {/* ── Q ring (donut) using evenodd fill rule ── */}
      <Path
        d="M 195 168 A 85 85 0 0 1 110 253 A 85 85 0 0 1 25 168 A 85 85 0 0 1 110 83 A 85 85 0 0 1 195 168 Z M 162 168 A 52 52 0 0 0 110 220 A 52 52 0 0 0 58 168 A 52 52 0 0 0 110 116 A 52 52 0 0 0 162 168 Z"
        fillRule="evenodd"
        fill={color}
      />

      {/* ── Center diamond sparkle inside Q ── */}
      <Path
        d="M 110 143 L 116 153 L 125 160 L 116 167 L 110 177 L 104 167 L 95 160 L 104 153 Z"
        fill={color}
      />

      {/* ── Q tail (vertical line + curls) ── */}
      <Path
        d="M 110 253 L 110 273"
        stroke={color}
        strokeWidth={15}
        strokeLinecap="round"
        fill="none"
      />
      {/* Left curl */}
      <Path
        d="M 110 273 Q 80 273 68 261 Q 58 249 70 241"
        stroke={color}
        strokeWidth={11}
        strokeLinecap="round"
        fill="none"
      />
      {/* Right curl */}
      <Path
        d="M 110 273 Q 140 273 152 261 Q 162 249 150 241"
        stroke={color}
        strokeWidth={11}
        strokeLinecap="round"
        fill="none"
      />
      {/* Bottom sparkle at tail junction */}
      <Path
        d="M 110 268 L 113 272 L 117 273 L 113 274 L 110 278 L 107 274 L 103 273 L 107 272 Z"
        fill={color}
      />

      {/* ── QUASAR text ── */}
      {showText && (
        <SvgText
          x="110"
          y="290"
          textAnchor="middle"
          fontSize="26"
          fontWeight="bold"
          letterSpacing="5"
          fill={color}
        >
          QUASAR
        </SvgText>
      )}
    </Svg>
  );
}
