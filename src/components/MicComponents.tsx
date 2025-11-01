async function getMicrophone() {
    try {
      // 1. "마이크 쓸게요" 요청 (팝업이 뜸)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // 3. 사용자가 '허용' 누르면 여기로 옴
      console.log("마이크 연결 성공!", stream);
  
    } catch (err) {
      // 2. 사용자가 '차단'을 눌렀거나 마이크가 고장 난 경우
      console.error("마이크 접근 실패", err);
      alert("마이크를 사용할 수 없습니다. 권한을 확인해주세요.");
    }
  }
  
  
/**
 * 오디오 Blob을 사용자의 컴퓨터에 파일로 다운로드합니다.
 * @param {Blob} audioBlob - MediaRecorder에서 생성된 오디오 Blob
 * @param {string} filename - 저장할 파일 이름 (예: "my_recording.ogg")
 */
function downloadAudio(audioBlob: Blob, filename: string = "recording.ogg") {
    // 1. Blob을 위한 임시 URL 생성
    const url = URL.createObjectURL(audioBlob);
  
    // 2. 보이지 않는 링크(<a>) 생성
    const link = document.createElement("a");
    link.style.display = "none"; // 눈에 보이지 않게
    document.body.appendChild(link); // DOM에 추가 (클릭하려면 필요)
  
    // 3. 링크 속성 설정
    link.href = url;
    link.download = filename ; // 파일 이름 설정
  
    // 4. 강제 클릭! (다운로드 시작)
    link.click();
  
    // 5. 정리
    // 클릭 후에는 임시 URL과 링크를 제거해 메모리를 확보합니다.
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
 }

 export { getMicrophone, downloadAudio };