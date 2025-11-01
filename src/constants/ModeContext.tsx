import { createContext, useContext, useState, type ReactNode } from 'react';

export type LessonMode = 'line' | 'syllable' | 'singalong' | null;

interface ModeContextValue {
  mode: LessonMode;
  setMode: (m: LessonMode) => void;
}

const ModeContext = createContext<ModeContextValue | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<LessonMode>(null);
  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used within ModeProvider');
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export const MODE_LABEL: Record<Exclude<LessonMode, null>, string> = {
  line: 'LINE LESSON',
  syllable: 'SYLLABLE LESSON',
  singalong: 'SING ALONG',
};
