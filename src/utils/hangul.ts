import { disassembleCompleteCharacter, combineVowels } from 'es-hangul';

export function extractVowels(sentence: string) {
  return sentence
    .split('')
    .filter(e => e != ' ')
    .map(extractVowel);
}

export function extractVowel(word: string) {
  const disassembled = disassembleCompleteCharacter(word);
  if (!disassembled) {
    // 영어 알파벳인 경우에만 '1' 반환, 특수 문자는 null 반환
    if (/[a-zA-Z]/.test(word)) {
      return '1';
    }
    return null;
  }
  const vowel = disassembled.jungseong;
  if (!vowel) return null;
  if (vowel.length == 1) return vowel;
  const [v1, v2] = vowel.split('');
  return combineVowels(v1, v2); // 이중모음
}
