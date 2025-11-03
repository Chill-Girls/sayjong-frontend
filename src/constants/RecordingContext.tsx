import { createContext, useContext, useState, type ReactNode } from 'react';

interface RecordingContextValue {
  recordedAudioBlob: Blob | null;
  setRecordedAudioBlob: (blob: Blob | null) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
}

const RecordingContext = createContext<RecordingContextValue | undefined>(undefined);

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  return (
    <RecordingContext.Provider
      value={{ recordedAudioBlob, setRecordedAudioBlob, isRecording, setIsRecording }}
    >
      {children}
    </RecordingContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRecording() {
  const ctx = useContext(RecordingContext);
  if (!ctx) throw new Error('useRecording must be used within RecordingProvider');
  return ctx;
}
