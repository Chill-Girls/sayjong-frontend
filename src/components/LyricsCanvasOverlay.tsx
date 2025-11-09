import React, { useEffect, useRef, useState } from 'react';

interface Syllable {
  text: string;
  start: number;
  end: number;
}

interface LyricLine {
  textOriginal: string;
  startTime: number;
  endTime: number;
  syllables: Syllable[];
}

interface LyricsCanvasOverlayProps {
  line: LyricLine | null;
  activeIndex: number | null;
}

const FALLBACK_MESSAGE = '표시할 가사가 없습니다.';

const LyricsCanvasOverlay: React.FC<LyricsCanvasOverlayProps> = ({ line, activeIndex }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize(prev =>
          prev.width === width && prev.height === height ? prev : { width, height },
        );
      }
    });

    observer.observe(parent);
    setSize(prev =>
      prev.width === parent.clientWidth && prev.height === parent.clientHeight
        ? prev
        : { width: parent.clientWidth, height: parent.clientHeight },
    );

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const { width, height } = size;

    if (!canvas || width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio ?? 1;
    canvas.width = Math.max(Math.floor(width * dpr), 1);
    canvas.height = Math.max(Math.floor(height * dpr), 1);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    if (!line || line.syllables.length === 0) {
      ctx.font = `500 ${Math.max(height * 0.18, 24)}px Pretendard, sans-serif`;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(FALLBACK_MESSAGE, width / 2, height / 2);
      return;
    }

    const highlightEnabled = typeof activeIndex === 'number';
    const syllables = line.syllables;
    const baseFontSize = Math.max(
      Math.min(width / Math.max(syllables.length * 0.8, 1), height * 0.35),
      28,
    );
    const letterSpacing = baseFontSize * 0.3;

    ctx.font = `500 ${baseFontSize}px Pretendard, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.lineJoin = 'round';

    const syllableMetrics = syllables.map(syll => {
      const text = (syll.text ?? '').trim() || ' ';
      return {
        text,
        width: ctx.measureText(text).width,
      };
    });

    const totalWidth = syllableMetrics.reduce(
      (sum, metric, index) => sum + metric.width + (index > 0 ? letterSpacing : 0),
      0,
    );

    let x = (width - totalWidth) / 2;
    const y = height / 2;
    const strokeWidth = Math.max(baseFontSize * 0.12, 2);

    syllableMetrics.forEach((metric, index) => {
      const isActive = highlightEnabled && index === activeIndex;
      const isPassed = highlightEnabled && typeof activeIndex === 'number' && index < activeIndex;
      const fillColor = isActive || isPassed ? '#f04299' : '#ffffff';

      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.strokeText(metric.text, x, y);
      ctx.fillStyle = fillColor;
      ctx.fillText(metric.text, x, y);

      x += metric.width + letterSpacing;
    });
  }, [line, activeIndex, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 4,
        pointerEvents: 'none',
        transition: 'opacity 150ms ease',
        opacity: line ? 1 : 0.6,
      }}
    />
  );
};

export default LyricsCanvasOverlay;
