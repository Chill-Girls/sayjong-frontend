import btn_next from '../assets/btn_next.svg';

interface BtnNextProps {
  style?: React.CSSProperties;
}
const BtnNext: React.FC<BtnNextProps> = ({ style }) => {
    return (
        <img src={btn_next} alt="next" style={style} />
    );
};
export default BtnNext;

