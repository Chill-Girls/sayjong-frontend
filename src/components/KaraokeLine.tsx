import React from 'react';
import type { UseKaraokeLyrics } from '../hooks/useKaraoke';
// 노래 가사를 박자에 맞게 변경해주는 컴포넌트

type KaraokeLineProps = {
  lyrics: UseKaraokeLyrics;
}; 

const KaraokeLine: React.FC<KaraokeLineProps> = ({ lyrics }) => {
  const { currentLine, activeSyllableIndex } = lyrics;

  if (!currentLine) {
    return null;
  }

  return (
    <div>
      {currentLine.syllables.map((syllable, index) => {
        const isActive =
          activeSyllableIndex !== null && activeSyllableIndex >= 0 && index <= activeSyllableIndex;

        return (
          <span
            key={syllable.text + index}
            style={{
              color: isActive ? '#f04299' : '#fff',
              textShadow: '2px 0 0 #000, 0 2px 0 #000, -2px 0 0 #000, 0 -2px 0 #000',
              transition: 'color 150ms',
            }}
          >
            {syllable.text}
          </span>
        );
      })}
    </div>
  );
};

export default KaraokeLine;
