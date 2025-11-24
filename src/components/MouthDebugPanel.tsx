import React from 'react';
import { COLORS, FONTS, FONT_WEIGHTS } from '../styles/theme';
import { scaled } from '../styles/mixins';
import { TARGET_BLENDSHAPES } from '../utils/blendshapeProcessor';

interface MouthDebugPanelProps {
  isVisible: boolean;
  displayVowel: string | null;
  displaySimilarity: number | null;
  displayBlendshapes: Record<string, number | undefined>;
  topOffset?: number;
}

const MouthDebugPanel: React.FC<MouthDebugPanelProps> = ({
  isVisible,
  displayVowel,
  displaySimilarity,
  displayBlendshapes,
  topOffset = 10,
}) => {
  if (!isVisible || !displayVowel) {
    return null;
  }

  const formattedSimilarity =
    displaySimilarity !== null ? `${(displaySimilarity * 100).toFixed(1)}%` : null;
  const similarityColor =
    displaySimilarity === null
      ? COLORS.white
      : displaySimilarity > 0.75
        ? '#4CAF50'
        : displaySimilarity > 0.6
          ? '#FFC107'
          : '#F44336';

  return (
    <div
      style={{
        position: 'absolute',
        top: scaled(topOffset),
        right: scaled(10),
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: COLORS.white,
        padding: `${scaled(12)} ${scaled(16)}`,
        borderRadius: scaled(8),
        fontSize: scaled(16),
        fontFamily: FONTS.primary,
        zIndex: 10,
        minWidth: scaled(220),
      }}
    >
      <div style={{ fontWeight: FONT_WEIGHTS.semibold, marginBottom: scaled(4) }}>
        Similarity Score (mouth shape)
      </div>
      <div style={{ fontSize: scaled(14), marginBottom: scaled(8) }}>모음: {displayVowel}</div>
      <div
        style={{
          fontSize: scaled(24),
          fontWeight: FONT_WEIGHTS.bold,
          color: similarityColor,
        }}
      >
        {formattedSimilarity ?? 'loading...'}
      </div>
      <div style={{ fontSize: scaled(12), marginTop: scaled(8), opacity: 0.8 }}>
        {TARGET_BLENDSHAPES.map(name => {
          const value = displayBlendshapes[name];
          const formattedValue =
            typeof value === 'number' && !Number.isNaN(value) ? value.toFixed(3) : 'N/A';
          return (
            <div key={name} style={{ marginTop: scaled(2) }}>
              {name}: {formattedValue}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MouthDebugPanel;
