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
import type { ScoreRecord } from '../api/scores/types';

interface GraphData {
  month: string;
  score: number;
}

interface TrainingLogChartProps {
  scoreRecords?: ScoreRecord[];
  averageScore?: number;
}

const TrainingLogChart: FunctionComponent<TrainingLogChartProps> = ({
  scoreRecords = [],
  averageScore,
}) => {
  // 월별 그래프 데이터 계산
  const graphData = useMemo<GraphData[]>(() => {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const now = new Date();
    const monthData = new Map<string, number[]>();

    // 최근 12개월 데이터 수집
    scoreRecords.forEach(record => {
      const scoredDate = new Date(record.scoredAt);
      const monthKey = `${scoredDate.getFullYear()}-${scoredDate.getMonth()}`;
      const existing = monthData.get(monthKey) || [];
      existing.push(record.score);
      monthData.set(monthKey, existing);
    });

    // 최근 12개월 데이터 생성
    const result: GraphData[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const scores = monthData.get(monthKey) || [];

      if (scores.length > 0) {
        // 노래별로 그룹화하여 평균 계산
        const groupedBySong = new Map<number, number[]>();
        scoreRecords
          .filter(r => {
            const rDate = new Date(r.scoredAt);
            return `${rDate.getFullYear()}-${rDate.getMonth()}` === monthKey;
          })
          .forEach(record => {
            const existing = groupedBySong.get(record.songId) || [];
            existing.push(record.score);
            groupedBySong.set(record.songId, existing);
          });

        const songAverages: number[] = [];
        groupedBySong.forEach(songScores => {
          const songAvg = songScores.reduce((sum, s) => sum + s, 0) / songScores.length;
          songAverages.push(songAvg);
        });

        const monthAvg =
          songAverages.length > 0
            ? Math.round(songAverages.reduce((sum, avg) => sum + avg, 0) / songAverages.length)
            : Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
        result.push({ month: monthNames[date.getMonth()], score: monthAvg });
      } else {
        result.push({ month: monthNames[date.getMonth()], score: 0 });
      }
    }

    return result;
  }, [scoreRecords]);

  const avg =
    averageScore !== undefined
      ? averageScore
      : Math.round(graphData.slice(-6).reduce((sum, d) => sum + d.score, 0) / 6);

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
          />
          <YAxis
            tick={{ fill: COLORS.textSecondary, fontSize: scaled(11), fontFamily: FONTS.primary }}
            domain={[0, 100]}
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
            dot={{ r: 4, strokeWidth: 2, stroke: COLORS.primary, fill: COLORS.primary }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrainingLogChart;
