import btnListenRecording from '../assets/btn_myrecording.svg';

import { useRecording } from '../constants/RecordingContext';

interface BtnListenRecordingProps {
  style?: React.CSSProperties;
}

const Btn_ListenRecording = ({ style }: BtnListenRecordingProps) => {
    const { recordedAudioBlob } = useRecording();   

    const handleClick = () => {
        if (recordedAudioBlob) {
            // 녹음된 오디오 재생
            const audioUrl = URL.createObjectURL(recordedAudioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
            
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
            };
        }
    };

    return (
        <img src={btnListenRecording} alt="listen recording" style={style} onClick={handleClick} />
    );
};
export default Btn_ListenRecording;