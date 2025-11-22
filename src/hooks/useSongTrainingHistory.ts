// TODO: 필요한 API import
// import { getTrainingSessions } from '../api/scores';
import type { TrainingSession } from '../api/scores/types';
import type { TrainingRecord } from './useTrainingRecords';

//SongTrainingHistoryCard 컴포넌트의 Props 타입
export interface SongTrainingHistoryCardProps {
  isClick: boolean;
  onClose: () => void;
  songTitle: string;
  songArtist: string;
  sessions: TrainingSession[];
}

//useSongTrainingHistory 파라미터 타입 (필요한 데이터)
export interface UseSongTrainingHistoryParams {
  songId: number | null;
  allSessions: TrainingSession[];
  trainingRecords: TrainingRecord[];
}

//useSongTrainingHistory 훅의 return 타입
export interface UseSongTrainingHistoryResult {
  // 상태 관리 (클릭 여부)
  isClick: boolean;
  setIsClick: (value: boolean) => void;

  // 노래 정보
  songTitle: string | null;
  songArtist: string | null;

  // 선택된 노래의 학습 기록
  sessions: TrainingSession[];

  // 열기 닫기
  openModal: () => void;
  closeModal: () => void;
}
