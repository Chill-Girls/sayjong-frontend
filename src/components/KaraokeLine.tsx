import React, { useMemo } from 'react'; // useMemo 임포트
import type { UseKaraokeLyrics } from '../hooks/useKaraoke';
// 노래 가사를 박자에 맞게 변경해주는 컴포넌트

type KaraokeLineProps = {
  lyrics: UseKaraokeLyrics;
};

// 렌더링할 가사 조각의 타입 정의
interface RenderableSegment {
  text: string;
  syllableIndex: number | null; // syllables 배열의 인덱스. 공백은 null
}

const KaraokeLine: React.FC<KaraokeLineProps> = ({ lyrics }) => {
  const { currentLine, activeSyllableIndex } = lyrics;

  const renderableSegments = useMemo(() => {
    if (!currentLine) {
      return [];
    }

    const { textOriginal, syllables } = currentLine;
    const segments: RenderableSegment[] = [];
    let lastSearchIndex = 0;

    syllables.forEach((syllable, syllableIndex) => {
      const syllableText = syllable.text;

      // 검색하기 전에 syllable.text에서 모든 공백(\s)을 제거
      const searchText = syllableText.replace(/\s/g, '');
      if (searchText === '') {
        return;
      }

      // 공백이 제거된 searchText로 originalText에서 위치 찾기
      const currentPos = textOriginal.indexOf(searchText, lastSearchIndex);

      if (currentPos === -1) {
        console.warn('Karaoke sync error: Cannot find segment', {
          syllableText,
          searchText,
          lastSearchIndex,
          textOriginal,
        });
        return;
      }

      // 공백 추가 (이전 음절 끝 ~ 현재 음절 시작)
      if (currentPos > lastSearchIndex) {
        const whitespace = textOriginal.substring(lastSearchIndex, currentPos);
        segments.push({
          text: whitespace,
          syllableIndex: null,
        });
      }

      // 실제 음절 텍스트
      segments.push({
        text: searchText,
        syllableIndex: syllableIndex,
      });

      // 다음 검색 위치
      lastSearchIndex = currentPos + searchText.length;
    });

    // 마지막 음절 뒤에 남은 텍스트 추가
    if (lastSearchIndex < textOriginal.length) {
      segments.push({
        text: textOriginal.substring(lastSearchIndex),
        syllableIndex: null,
      });
    }

    return segments;
  }, [currentLine]);

  if (!currentLine) {
    return null;
  }

  // 공통 스타일
  const syllableStyle: React.CSSProperties = {
    textShadow: '2px 0 0 #000, 0 2px 0 #000, -2px 0 0 #000, 0 -2px 0 #000',
    transition: 'color 150ms',
    fontSize: '35px',
    whiteSpace: 'pre-wrap',
  };

  return (
    <div>
      {renderableSegments.map((segment, index) => {
        const { text, syllableIndex } = segment;

        const isActive =
          syllableIndex !== null &&
          activeSyllableIndex !== null &&
          activeSyllableIndex >= 0 &&
          syllableIndex <= activeSyllableIndex;

        return (
          <span
            key={`${text}-${index}`}
            style={{
              ...syllableStyle,
              color: isActive ? '#f04299' : '#fff',
            }}
          >
            {text}
          </span>
        );
      })}
    </div>
  );
};

export default KaraokeLine;
