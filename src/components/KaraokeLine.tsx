// 글씨 색 시간에 따라 변경해주는 컴포넌트
import React from 'react';

interface Syllable {
  text: string;
  start: number;
  end: number;
}

interface LyricLine {
  textOriginal: string;
  startTime: number;
  endTime: number;
  syllables: Syllable[];
}

interface KaraokeLineProps {
  line: LyricLine;
  currentTime?: number;
  activeIndex?: number | null;
}

const KaraokeLine: React.FC<KaraokeLineProps> = ({ line, currentTime = 0, activeIndex = null }) => {
  const highlightByIndex = typeof activeIndex === 'number';

  return (
    <div
      style={{
        width: '100%',
        position: 'relative',
        fontSize: '64px',
        letterSpacing: '0.3em',
        fontWeight: 500,
        fontFamily: 'Pretendard',
        textAlign: 'left',
        display: 'inline-block',
      }}
    >
      {line.syllables.map((syll, i) => {
        const isPassed = highlightByIndex ? i < (activeIndex ?? -1) : currentTime > syll.end;
        const isActive = highlightByIndex
          ? i === activeIndex
          : currentTime >= syll.start && currentTime < syll.end;

        // 이미 부르거나 현재 부르는 중이면 핑크색
        const isPink = isPassed || isActive;

        return (
          <span
            key={i}
            style={{
              color: isPink ? '#f04299' : '#fff',
              textShadow: '2px 0 0 #000, 0 2px 0 #000, -2px 0 0 #000, 0 -2px 0 #000',
              transition: 'color 150ms',
            }}
          >
            {syll.text}
          </span>
        );
      })}
    </div>
  );
};

export default KaraokeLine;
