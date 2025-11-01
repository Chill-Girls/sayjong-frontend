import { createContext, useContext, useState, type ReactNode } from 'react';

interface RecordingContextValue {
  recordedAudioBlob: Blob | null;
  setRecordedAudioBlob: (blob: Blob | null) => void;
}

const RecordingContext = createContext<RecordingContextValue | undefined>(undefined);

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  return (
    <RecordingContext.Provider value={{ recordedAudioBlob, setRecordedAudioBlob }}>
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

