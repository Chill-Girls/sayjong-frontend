import btnListenRecording from '../assets/btn_myrecording.svg';

interface BtnListenRecordingProps {
  style?: React.CSSProperties;
}

const Btn_ListenRecording: React.FC<BtnListenRecordingProps> = ({ style }) => {
    return (
        <img src={btnListenRecording} alt="listen recording" style={style} />
    );
};
export default Btn_ListenRecording;