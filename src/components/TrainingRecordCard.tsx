import type { FunctionComponent } from 'react';
import type { TrainingRecord } from '../hooks/useTrainingRecords';
import { COLORS, FONTS, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../styles/theme';
import { flexColumn, scaled } from '../styles/mixins';

interface TrainingRecordCardProps {
  record: TrainingRecord;
  index: number;
  onClick?: () => void;
}

const TrainingRecordCard: FunctionComponent<TrainingRecordCardProps> = ({ record, index, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        width: '100%',
        height: scaled(224),
        borderRadius: BORDER_RADIUS.xl,
        backgroundColor: COLORS.white,
        border: `1px solid ${COLORS.textSecondary}`,
        boxShadow: index > 0 ? SHADOWS.card : 'none',
        padding: `${scaled(24)} ${scaled(36)} ${scaled(24)} ${scaled(30)}`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: scaled(36),
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = SHADOWS.card;
        }
      }}
      onMouseLeave={e => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = index > 0 ? SHADOWS.card : 'none';
        }
      }}
    >
      {record.imageUrl && (
        <img
          src={record.imageUrl}
          alt={record.title}
          style={{
            width: scaled(176),
            height: scaled(176),
            borderRadius: BORDER_RADIUS.xl,
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ ...flexColumn, gap: scaled(8), flex: 1 }}>
        <div
          style={{
            fontSize: scaled(30),
            fontWeight: FONT_WEIGHTS.semibold,
            color: COLORS.dark,
            letterSpacing: scaled(-0.02),
            fontFamily: FONTS.primary,
          }}
        >
          {record.titleEng}
        </div>
        {record.artist && (
          <div
            style={{
              fontSize: scaled(24),
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.dark,
              letterSpacing: scaled(-0.02),
              fontFamily: FONTS.primary,
            }}
          >
            {record.artist}
          </div>
        )}
        <div style={{ display: 'flex', gap: scaled(25), marginTop: scaled(8) }}>
          {record.averageScore !== undefined && (
            <div>
              <div
                style={{
                  fontSize: scaled(20),
                  fontWeight: FONT_WEIGHTS.semibold,
                  color: COLORS.dark,
                  letterSpacing: scaled(-0.02),
                  marginBottom: scaled(4),
                  fontFamily: FONTS.primary,
                }}
              >
                Average
              </div>
              <div
                style={{
                  fontSize: scaled(27),
                  fontWeight: FONT_WEIGHTS.extrabold,
                  color: COLORS.primary,
                  letterSpacing: scaled(-0.02),
                  fontFamily: FONTS.primary,
                }}
              >
                {record.averageScore}%
              </div>
            </div>
          )}
          {record.bestScore !== undefined && (
            <div>
              <div
                style={{
                  fontSize: scaled(20),
                  fontWeight: FONT_WEIGHTS.semibold,
                  color: COLORS.dark,
                  letterSpacing: scaled(-0.02),
                  marginBottom: scaled(4),
                  fontFamily: FONTS.primary,
                }}
              >
                Best Score
              </div>
              <div
                style={{
                  fontSize: scaled(27),
                  fontWeight: FONT_WEIGHTS.extrabold,
                  color: COLORS.primary,
                  letterSpacing: scaled(-0.02),
                  fontFamily: FONTS.primary,
                }}
              >
                {record.bestScore}%
              </div>
            </div>
          )}
          {record.recentScore !== undefined && (
            <div>
              <div
                style={{
                  fontSize: scaled(20),
                  fontWeight: FONT_WEIGHTS.semibold,
                  color: COLORS.dark,
                  letterSpacing: scaled(-0.02),
                  marginBottom: scaled(4),
                  fontFamily: FONTS.primary,
                }}
              >
                Recent Score
              </div>
              <div
                style={{
                  fontSize: scaled(27),
                  fontWeight: FONT_WEIGHTS.extrabold,
                  color: COLORS.primary,
                  letterSpacing: scaled(-0.02),
                  fontFamily: FONTS.primary,
                }}
              >
                {record.recentScore}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingRecordCard;
