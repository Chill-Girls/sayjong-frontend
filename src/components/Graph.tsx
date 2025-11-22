import type { FunctionComponent } from 'react';
import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { COLORS, FONTS, FONT_WEIGHTS } from '../styles/theme';
import { scaled } from '../styles/mixins';
import type { TrainingSession } from '../api/scores/types';

interface GraphData {
  date: string;
  score: number;
}

interface TrainingLogChartProps {
  scoreRecords?: TrainingSession[];
  averageScore?: number;
}

const TrainingLogChart: FunctionComponent<TrainingLogChartProps> = ({
  scoreRecords = [],
  averageScore,
}) => {
  const [weekOffset, setWeekOffset] = useState(0); // 현재 표시할 주의 오프셋 (0 = 현재 주)
  
  // 7일 단위 주차 계산 및 그래프 데이터 생성
  const { graphData, currentWeekLabel } = useMemo(() => {
    const result: GraphData[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // 7일 단위로 주차를 계산하는 함수 (월의 1일부터 시작, 7일씩 나눔)
    const getWeekNumber = (date: Date): { weekNum: number; month: number; year: number } => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      
      // 월의 1일부터 시작해서 7일 단위로 주차 계산
      const weekNum = Math.floor((day - 1) / 7) + 1;
      return { weekNum, month, year };
    };
    const getWeekStartDate = (date: Date): Date => {
      const { weekNum, month, year } = getWeekNumber(date);
      const startDay = (weekNum - 1) * 7 + 1;
      return new Date(year, month, startDay);
    };

    // 현재 주차 기준으로 오프셋 적용
    const currentWeekDate = new Date(now);
    currentWeekDate.setDate(now.getDate() - weekOffset * 7);
    const { weekNum: currentWeek, month: currentMonth } = getWeekNumber(currentWeekDate);

    // Current week label
    const weekLabel = `${currentMonth + 1} Week ${currentWeek}`;

    // 현재 주차의 시작일 계산
    const weekStartDate = getWeekStartDate(currentWeekDate);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    
    const dateKeys: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(weekStartDate.getDate() + i);
      
      // 날짜가 해당 월을 벗어나면 중단
      if (date.getMonth() !== currentMonth) {
        break;
      }
      
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dateKey = `${month}/${day}`;
      dateKeys.push(dateKey);
      result.push({
        date: dateKey,
        score: 0,
      });
    }

    // 데이터를 날짜별로 그룹화 (해당 날짜에 연습한 노래들의 평균 점수 합산)
    const groupedData = new Map<string, { sum: number; count: number }>();

    scoreRecords.forEach(session => {
      const sessionDate = new Date(session.lastPlayedAt);
      sessionDate.setHours(0, 0, 0, 0);
      
      // 현재 주차 범위 내인지 확인
      if (sessionDate >= weekStartDate && sessionDate <= weekEndDate && 
          sessionDate.getMonth() === currentMonth) {
        const month = sessionDate.getMonth() + 1;
        const day = sessionDate.getDate();
        const dateKey = `${month}/${day}`;
        
        // 표시할 날짜 목록에 포함된 경우만 처리
        if (dateKeys.includes(dateKey)) {
          const current = groupedData.get(dateKey) || { sum: 0, count: 0 };
          current.sum += session.averageScore;
          current.count += 1;
          groupedData.set(dateKey, current);
        }
      }
    });

    // 합산된 데이터를 나누어 '날짜별 평균' 계산
    result.forEach((item, index) => {
      const data = groupedData.get(item.date);
      if (data && data.count > 0) {
        // (모든 노래 평균 점수의 합) / (노래 개수)
        result[index].score = Math.round(data.sum / data.count);
      }
    });

    return { graphData: result, currentWeekLabel: weekLabel };
  }, [scoreRecords, weekOffset]);

  const avg =
    averageScore !== undefined
      ? averageScore
      : Math.round(
          graphData
            .filter(d => d.score > 0)
            .reduce((sum, d, _, arr) => sum + d.score / arr.length, 0) || 0,
        );

  return (
    <div
      style={{
        border: `1px solid ${COLORS.textSecondary}`,
        borderRadius: scaled(16),
        padding: scaled(24),
        background: COLORS.white,
      }}
    >
      <h2
        style={{
          margin: `0 0 ${scaled(12)}`,
          fontSize: scaled(20),
          fontFamily: FONTS.primary,
          fontWeight: FONT_WEIGHTS.semibold,
          color: COLORS.dark,
        }}
      >
        Pronunciation Improvement Trend
      </h2>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: `${scaled(4)} 0 ${scaled(20)}`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: scaled(14),
            color: COLORS.textSecondary,
            fontFamily: FONTS.primary,
          }}
        >
          Average Score{' '}
          <span style={{ color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold }}>{avg}%</span>
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: scaled(16),
          }}
        >
          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            style={{
              width: scaled(32),
              height: scaled(32),
              borderRadius: '50%',
              border: `1px solid ${COLORS.textSecondary}`,
              backgroundColor: COLORS.white,
              color: COLORS.dark,
              fontSize: scaled(18),
              fontWeight: FONT_WEIGHTS.semibold,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONTS.primary,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = COLORS.background;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = COLORS.white;
            }}
          >
            ←
          </button>
          <span
            style={{
              fontSize: scaled(14),
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.dark,
              fontFamily: FONTS.primary,
              minWidth: scaled(80),
              textAlign: 'center',
            }}
          >
            {currentWeekLabel}
          </span>
          <button
            onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
            disabled={weekOffset === 0}
            style={{
              width: scaled(32),
              height: scaled(32),
              borderRadius: '50%',
              border: `1px solid ${COLORS.textSecondary}`,
              backgroundColor: weekOffset === 0 ? COLORS.background : COLORS.white,
              color: weekOffset === 0 ? COLORS.textSecondary : COLORS.dark,
              fontSize: scaled(18),
              fontWeight: FONT_WEIGHTS.semibold,
              cursor: weekOffset === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONTS.primary,
              transition: 'all 0.2s',
              opacity: weekOffset === 0 ? 0.5 : 1,
            }}
            onMouseEnter={e => {
              if (weekOffset !== 0) {
                e.currentTarget.style.backgroundColor = COLORS.background;
              }
            }}
            onMouseLeave={e => {
              if (weekOffset !== 0) {
                e.currentTarget.style.backgroundColor = COLORS.white;
              }
            }}
          >
            →
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300 * 0.75}>
        <LineChart data={graphData}>
          <CartesianGrid stroke={COLORS.gray} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: COLORS.textSecondary, fontSize: scaled(11), fontFamily: FONTS.primary }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: COLORS.textSecondary, fontSize: scaled(11), fontFamily: FONTS.primary }}
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: COLORS.white,
              border: `1px solid ${COLORS.textSecondary}`,
              borderRadius: scaled(8),
              fontFamily: FONTS.primary,
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={COLORS.primary}
            strokeWidth={3}
            activeDot={{ r: 6 }}
            dot={{ r: 4, strokeWidth: 2, stroke: COLORS.primary, fill: COLORS.white }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrainingLogChart;
