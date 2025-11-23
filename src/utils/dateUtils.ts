//날짜 문자열을 "YYYY.MM.DD" 형식으로 변환하는 함수
export function formatDate(dateString: string, format?: string): string {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return dateString;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  let hour24 = date.getHours(); // 0-23
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12; // 0시(자정/정오)는 12로 표시

  const ampm = hour24 >= 12 ? 'pm' : 'am';
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  // 요청된 포맷: 'YYYY.MM.DD am/pm H:MM'
  const targetFormat = format || 'YYYY.MM.DD';

  let formattedString = targetFormat;
  formattedString = formattedString.replace('YYYY', String(year));
  formattedString = formattedString.replace('MM', month);
  formattedString = formattedString.replace('DD', day);

  // 시간 컴포넌트 치환
  formattedString = formattedString.replace('A', ampm);
  formattedString = formattedString.replace('h', String(hour12));
  formattedString = formattedString.replace('mm', minute);
  formattedString = formattedString.replace('ss', second);

  // 24시간제 HH, H 포맷을 사용하는 경우를 위한 기본값 치환
  formattedString = formattedString.replace('HH', String(hour24).padStart(2, '0'));
  formattedString = formattedString.replace('H', String(hour24));

  return formattedString;
}
