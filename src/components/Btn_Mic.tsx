import btnMic from '../assets/btn_mic.svg';
import btnMicProcess from '../assets/btn_mic_process.svg';
import { useRef } from 'react';
import { useRecording } from '../constants/RecordingContext';

interface BtnMicProps {
  style?: React.CSSProperties;
}

const Btn_Mic: React.FC<BtnMicProps> = ({ style }) => {
  const { setRecordedAudioBlob, isRecording, setIsRecording } = useRecording();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleClick = async () => {
    if (!isRecording) {
      // 녹음 시작
      try {
        const mediaStreamConstraints = {
          audio: {
            channelCount: 1,
            sampleRate: 48000,
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = event => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/ogg' });

          setRecordedAudioBlob(audioBlob);
          console.log('녹음 완료, webm 데이터를 ogg로 라벨링하여 저장');

          // 스트림 정리
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        console.log('녹음 시작 (브라우저 기본 포맷, Mono, 48kHz)');
      } catch (error) {
        console.error('마이크 접근 실패', error);
        alert('마이크를 사용할 수 없습니다. 권한을 확인해주세요.');
        setIsRecording(false);
      }
    } else {
      // 녹음 중지
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        console.log('녹음 중지 및 저장');
      }
    }
  };
  const iconSrc = isRecording ? btnMicProcess : btnMic;
  return <img src={iconSrc} alt="mic" style={style} onClick={handleClick} />;
};

export default Btn_Mic;
