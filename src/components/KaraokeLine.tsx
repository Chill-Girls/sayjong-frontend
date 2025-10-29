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
  currentTime: number;
} // 노션보고 넣었는데 맞는지 모르겠음!

const KaraokeLine: React.FC<KaraokeLineProps> = ({ line, currentTime }) => {
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
        const isPassed = currentTime > syll.end;
        const isActive = currentTime >= syll.start && currentTime < syll.end;

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
