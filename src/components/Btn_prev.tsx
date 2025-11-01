import btn_prev from '../assets/btn_prev.svg';

interface BtnPrevProps {
  style?: React.CSSProperties;
}

const Btn_prev: React.FC<BtnPrevProps> = ({ style }) => {
    return (
        <img src={btn_prev} alt="prev" style={style} />
    );
};
export default Btn_prev;