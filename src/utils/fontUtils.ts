/**
 * fontUtils.ts
 * 폰트 크기 관련 유틸리티 함수
 */

/**
 * 글자 수에 따라 폰트 크기를 조정하는 함수
 * 한글과 영문을 구분하여 대략적인 문자 폭을 계산하고,
 * 텍스트 길이에 따라 적절한 폰트 크기를 반환합니다.
 * 
 * @param text - 폰트 크기를 조정할 텍스트
 * @param baseSize - 기본 폰트 크기
 * @param maxSize - 최대 폰트 크기
 * @param minSize - 최소 폰트 크기
 * @returns 조정된 폰트 크기
 */
export function getAdaptiveFontSize(
  text: string,
  baseSize: number,
  maxSize: number,
  minSize: number,
): number {
  // 한글은 2바이트, 영문은 1바이트로 계산
  // 대략적인 비율: 한글 1자 ≈ 영문 1.5자
  const approxChars =
    text.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '').length * 1 +
    (text.match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g) || []).length * 1.5;

  if (approxChars > 20) {
    const adjustedSize = Math.max(minSize, baseSize * (20 / approxChars));
    return Math.min(maxSize, adjustedSize);
  }
  return Math.min(maxSize, baseSize);
}

