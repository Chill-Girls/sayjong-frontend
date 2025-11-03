import { useState } from 'react';
import btnListenRecording from '../assets/btn_myrecording.svg';
import btnListenRecordingProcess from '../assets/btn_myrecording_process.svg';
import { useRecording } from '../constants/RecordingContext';

interface BtnListenRecordingProps {
  style?: React.CSSProperties;
}

const Btn_ListenRecording = ({ style }: BtnListenRecordingProps) => {
  const { recordedAudioBlob, isRecording } = useRecording();
  const [isPlaying, setIsPlaying] = useState(false);
  const iconSrc = isPlaying ? btnListenRecordingProcess : btnListenRecording;
  const isDisabled = isRecording || isPlaying || !recordedAudioBlob;

  const handleClick = () => {
    if (isDisabled) return;
    if (recordedAudioBlob) {
      setIsPlaying(true);
      // 녹음된 오디오 재생
      const audioUrl = URL.createObjectURL(recordedAudioBlob);
      const audio = new Audio(audioUrl);
      audio.play();

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsPlaying(false);
      };

      audio.onerror = () => {
        console.error('Audio playback error');
        setIsPlaying(false);
      };
    }
  };

  return (
    <img
      src={iconSrc}
      alt="listen recording"
      style={{
        ...style,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
      }}
      onClick={handleClick}
    />
  );
};
export default Btn_ListenRecording;
