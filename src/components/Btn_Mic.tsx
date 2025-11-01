import btnMic from '../assets/btn_mic.svg';
import { useState, useRef } from 'react';
import { useRecording } from '../constants/RecordingContext';

interface BtnMicProps {
  style?: React.CSSProperties;
}

const Btn_Mic: React.FC<BtnMicProps> = ({ style }) => {
    const { setRecordedAudioBlob } = useRecording();
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleClick = async () => {
        if (!isRecording) {
            // 녹음 시작
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    // 녹음 데이터를 Context에 저장
                    setRecordedAudioBlob(audioBlob);
                    console.log('녹음 완료, temp 폴더에 저장됨 (메모리)');
                    
                    // 스트림 정리
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);
                console.log('녹음 시작');
            } catch (error) {
                console.error('마이크 접근 실패', error);
                alert('마이크를 사용할 수 없습니다. 권한을 확인해주세요.');
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

    return (
        <img src={btnMic} alt="mic" style={style} onClick={handleClick} />
    );
};

export default Btn_Mic;