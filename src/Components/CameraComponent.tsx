import { button, useControls } from 'leva';
import React, { useCallback, useEffect, useRef } from 'react';
import type { FC } from 'react';
import Webcam from 'react-webcam';
import { css } from '@emotion/css';
import { Camera } from '@mediapipe/camera_utils';
import {
  FaceMesh,
  FACEMESH_LEFT_EYE,
  FACEMESH_LIPS,
  FACEMESH_RIGHT_EYE,
  type Results,
} from '@mediapipe/face_mesh';
import { draw } from '../utils/drawCanvas.tsx';

interface Props {
  onLandmarksDetected?: (landmarks: any[] | null) => void;
  anchoredPoints?: any[];
  width?: number;
  height?: number;
}

export const App: FC<Props> = ({
  onLandmarksDetected,
  anchoredPoints,
  width = 1280,
  height = 720,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultsRef = useRef<Results | undefined>(undefined);

  // コントローラーの追加
  const datas = useControls({
    bgImage: true,
    landmark: {
      min: 0,
      max: 477,
      step: 1,
      value: 0,
    },
    result: button(() => {
      OutputData();
    }),
  });

  /** 検出結果をconsoleに出力する */
  const OutputData = () => {
    const results = resultsRef.current!;
    console.log(results.multiFaceLandmarks[0]);
    console.log('FACEMESH_LEFT_EYE', FACEMESH_LEFT_EYE);
    console.log('FACEMESH_RIGHT_EYE', FACEMESH_RIGHT_EYE);
    console.log('FACEMESH_LIPS', FACEMESH_LIPS);
  };

  /** 検出結果（フレーム毎に呼び出される） */
  const onResults = useCallback(
    (results: Results) => {
      // 検出結果の格納
      resultsRef.current = results;
      // 描画処理
      const ctx = canvasRef.current!.getContext('2d')!;
      draw(ctx, results, datas.bgImage, datas.landmark, anchoredPoints);

      // 랜드마크 데이터를 부모 컴포넌트로 전달
      if (onLandmarksDetected && results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
        onLandmarksDetected(results.multiFaceLandmarks[0]);
      } else if (onLandmarksDetected) {
        onLandmarksDetected(null);
      }
    },
    [datas, onLandmarksDetected, anchoredPoints],
  );

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: file => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: false, // landmarks 468개만 사용
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResults);

    if (webcamRef.current) {
      const camera = new Camera(webcamRef.current.video!, {
        onFrame: async () => {
          await faceMesh.send({ image: webcamRef.current!.video! });
        },
        width,
        height,
      });
      camera.start();
    }

    return () => {
      faceMesh.close();
    };
  }, [onResults, width, height]);

  return (
    <div className={styles.container}>
      {/* capture */}
      <Webcam
        ref={webcamRef}
        style={{ visibility: 'hidden' }}
        audio={false}
        width={width}
        height={height}
        mirrored
        screenshotFormat="image/jpeg"
        videoConstraints={{ width, height, facingMode: 'user' }}
      />
      {/* draw */}
      <canvas ref={canvasRef} className={styles.canvas} width={width} height={height} />
    </div>
  );
};

// ==============================================
// styles

const styles = {
  container: css`
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  canvas: css`
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #1e1e1e;
    border: 1px solid #fff;
    transform: scaleX(-1);
    object-fit: contain;
  `,
};
