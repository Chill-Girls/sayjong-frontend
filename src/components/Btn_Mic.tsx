import btnMic from '../assets/btn_mic.svg';
import { useState, useRef } from 'react';

interface BtnMicProps {
  style?: React.CSSProperties;
}

const Btn_Mic: React.FC<BtnMicProps> = ({ style }) => {
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
                    // 녹음 파일 저장
                    const url = URL.createObjectURL(audioBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `recording_${Date.now()}.webm`;
                    link.click();
                    URL.revokeObjectURL(url);
                    
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