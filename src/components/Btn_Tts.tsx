import btnTts from '../assets/btn_tts.svg';

interface BtnTtsProps {
  style?: React.CSSProperties;
}

const Btn_Tts: React.FC<BtnTtsProps> = ({ style }) => {
    return (
        <img src={btnTts} alt="tts" style={style} />
    );
};
export default Btn_Tts;