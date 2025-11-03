import { useState, useEffect, useRef } from 'react';
import { getPronunciationAccuracy } from '../api/pronunciation';
import { useRecording } from '../constants/RecordingContext';

function blobToBase64(blob: Blob): Promise<string> {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('FileReader result is not a string'));
      }
    };
    reader.onerror = () => {
      reject(reader.error || new Error('Blob to Base64 conversion failed'));
    };
    reader.readAsDataURL(blob);
  });
}

export function usePronunciationCheck(titleToEvaluate: string) {
  const { recordedAudioBlob, isRecording } = useRecording();

  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processedBlobRef = useRef<Blob | null>(null);

  // 녹음 완료 시 API 호출
  useEffect(() => {
    let isCancelled = false;

    if (recordedAudioBlob && recordedAudioBlob !== processedBlobRef.current) {
      processedBlobRef.current = recordedAudioBlob;

      const fetchScore = async () => {
        setIsLoading(true);
        setScore(null);
        setError(null);

        try {
          const base64Audio = await blobToBase64(recordedAudioBlob);
          console.log(base64Audio); //TODO: for debug! remove this
          const resultScore = await getPronunciationAccuracy({
            title: titleToEvaluate,
            language: 'ko',
            base64Audio: base64Audio,
          });
          if (!isCancelled) {
            setScore(resultScore);
          }
        } catch (err) {
          if (!isCancelled) {
            if (err instanceof Error) {
              setError(err.message);
            } else {
              setError('An unknown error occurred.');
            }
          }
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      };

      if (titleToEvaluate) {
        fetchScore();
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [recordedAudioBlob, titleToEvaluate]);

  // 녹음 시작 시 상태 초기화
  useEffect(() => {
    if (isRecording) {
      setScore(null);
      setError(null);
    }
  }, [isRecording]);

  // 평가할 텍스트가 바뀌면 점수 초기화
  useEffect(() => {
    setScore(null);
    setError(null);
    setIsLoading(false);
    processedBlobRef.current = null;
  }, [titleToEvaluate]);

  return { isLoading, score, error };
}
