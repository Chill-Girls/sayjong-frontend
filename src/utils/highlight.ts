export interface HighlightedChar {
  char: string;
  isHighlighted: boolean;
}

/**
 * 문자 배열과 마스크(0/1)를 받아 강조 여부를 지정한 배열을 반환합니다.
 * 1일 때 틀린거
 */
export function mapCharsWithMask(chars: string[], mask: number[]): HighlightedChar[] {
  return chars.map((char, index) => ({
    char,
    isHighlighted: !!mask[index],
  }));
}
