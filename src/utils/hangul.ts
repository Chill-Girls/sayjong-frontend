import { disassembleCompleteCharacter, combineVowels } from 'es-hangul';

export function extractVowels(sentence: string) {
  return sentence
    .split('')
    .filter(e => e != ' ')
    .map(extractVowel);
}

export function extractVowel(word: string) {
  const disassembled = disassembleCompleteCharacter(word);
  if (!disassembled) return null;
  const vowel = disassembled.jungseong;
  if (!vowel) return null;
  if (vowel.length == 1) return vowel;
  const [v1, v2] = vowel.split('');
  return combineVowels(v1, v2); // 이중모음
}

/**
 * markName에서 화면에 표시할 마지막 음절을 안전하게 추출하는 유틸
 * 우선순위: 한글 음절(가-힣) > 연속 모음 자모 결합(ㅗ+ㅏ=ㅘ, ㅘ+ㅣ=ㅙ 등) > 자모 > 토큰 > 마지막 문자
 */
export function extractSyllable(markName: string | null | undefined): string | null {
  if (!markName) return null;
  const raw = String(markName);

  // 래퍼/공백 제거
  const cleaned = raw.replace(/[\{\}\[\]\(\)<>]/g, '').replace(/\s+/g, '');

  // 1) 한글 음절(U+AC00–U+D7A3)
  const syllableMatches = cleaned.match(/[\uAC00-\uD7A3]/g);
  if (syllableMatches && syllableMatches.length) {
    return syllableMatches[syllableMatches.length - 1];
  }

  // 2) 연속 "모음 자모"(U+314F–U+3163) 클러스터 결합 시도: 예) ㅗㅏ -> ㅘ, ㅘㅣ -> ㅙ
  const vowelClusterMatches = cleaned.match(/[\u314F-\u3163]+/g);
  if (vowelClusterMatches && vowelClusterMatches.length) {
    const cluster = vowelClusterMatches[vowelClusterMatches.length - 1];
    if (cluster.length === 1) return cluster;
    // 다중 모음 결합(좌→우 순서로 결합)
    let combined = cluster[0];
    for (let i = 1; i < cluster.length; i++) {
      try {
        combined = combineVowels(combined, cluster[i]) || cluster[i]; // 결합 실패 시 마지막 모음 유지
      } catch {
        combined = cluster[i];
      }
    }
    return combined;
  }

  // 3) 호환 자모(U+3131–U+318E) — 마지막 자모 1글자
  const jamoMatches = cleaned.match(/[\u3131-\u318E]/g);
  if (jamoMatches && jamoMatches.length) {
    return jamoMatches[jamoMatches.length - 1];
  }

  // 4) 구분자 기준 마지막 토큰의 마지막 글자 시도
  const tokens = cleaned.split(/[_|\-\/]/).filter(Boolean);
  if (tokens.length) {
    const t = tokens[tokens.length - 1];
    const mm = t.match(/[\uAC00-\uD7A3\u3131-\u318E]/g);
    if (mm && mm.length) return mm[mm.length - 1];
    return t.slice(-1);
  }

  // 5) 최후 폴백: 마지막 문자
  return cleaned.length ? cleaned.slice(-1) : null;
}