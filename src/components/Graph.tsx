import type { FunctionComponent } from 'react';
import { useMemo } from 'react';
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
  month: string;
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
  // 월별 그래프 데이터 계산
  const graphData = useMemo<GraphData[]>(() => {
    const monthNames = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];
    const result: GraphData[] = [];
    const now = new Date();

    // 최근 12개월의 'YYYY-M' 키와 초기 데이터 생성
    const monthKeys: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthKeys.push(`${d.getFullYear()}-${d.getMonth()}`);

      // 초기값 0으로 설정
      result.push({
        month: monthNames[d.getMonth()],
        score: 0,
      });
    }

    // 데이터를 월별로 그룹화 (해당 월에 연습한 노래들의 평균 점수 합산)
    const groupedData = new Map<string, { sum: number; count: number }>();

    scoreRecords.forEach(session => {
      const date = new Date(session.lastPlayedAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      // 그래프에 표시할 12개월 범위 내인지 확인
      if (monthKeys.includes(key)) {
        const current = groupedData.get(key) || { sum: 0, count: 0 };

        // 해당 노래의 '평균 점수'를 더함
        current.sum += session.averageScore;
        current.count += 1;

        groupedData.set(key, current);
      }
    });

    // 합산된 데이터를 나누어 '월별 평균' 계산
    monthKeys.forEach((key, index) => {
      const data = groupedData.get(key);
      if (data && data.count > 0) {
        // (모든 노래 평균 점수의 합) / (노래 개수)
        result[index].score = Math.round(data.sum / data.count);
      }
    });

    return result;
  }, [scoreRecords]);

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

      <p
        style={{
          margin: `${scaled(4)} 0 ${scaled(20)}`,
          fontSize: scaled(14),
          color: COLORS.textSecondary,
          fontFamily: FONTS.primary,
        }}
      >
        Average Score (Last 6 Months){' '}
        <span style={{ color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold }}>{avg}%</span>
      </p>

      <ResponsiveContainer width="100%" height={300 * 0.75}>
        <LineChart data={graphData}>
          <CartesianGrid stroke={COLORS.gray} vertical={false} />
          <XAxis
            dataKey="month"
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
