import { disassembleCompleteCharacter, combineVowels } from 'es-hangul';

export function extractVowels(sentence: string) {
  return sentence
    .split('')
    .filter(e => e != ' ')
    .map(extractVowel);
}

function extractVowel(word: string) {
  const disassembled = disassembleCompleteCharacter(word);
  if (!disassembled) return null;
  const vowel = disassembled.jungseong;
  if (!vowel) return null;
  if (vowel.length == 1) return vowel;
  const [v1, v2] = vowel.split('');
  return combineVowels(v1, v2); // 이중모음 
}
