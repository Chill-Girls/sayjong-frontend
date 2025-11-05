# Hooks 가이드

이 디렉토리에는 프로젝트에서 사용하는 커스텀 React 훅들이 포함되어 있습니다. 각 훅은 특정 기능 영역의 로직을 캡슐화하여 UI 컴포넌트와 비즈니스 로직을 분리합니다.

## 목차

- [인증 관련 훅](#인증-관련-훅)
- [노래 데이터 관련 훅](#노래-데이터-관련-훅)
- [캘리브레이션 관련 훅](#캘리브레이션-관련-훅)
- [발음 평가 관련 훅](#발음-평가-관련-훅)
- [UI 오버레이 관련 훅](#ui-오버레이-관련-훅)

---

## 인증 관련 훅

### `useAuth`

사용자 인증(로그인, 회원가입)을 처리하는 훅입니다.

**위치**: `src/hooks/useAuth.ts`

**반환값**:
```typescript
{
  handleLogin: (credentials: LoginRequest) => Promise<{ success: boolean; tokenInfo?: Token; error?: string }>;
  handleSignUp: (credentials: SignupRequest) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  error: string | null;
}
```

**사용 예시**:
```typescript
import { useAuth } from '../hooks/useAuth';

function LoginComponent() {
  const { handleLogin, handleSignUp, isLoading, error } = useAuth();
  
  const onLogin = async () => {
    const result = await handleLogin({
      loginId: 'user123',
      userPassword: 'password123'
    });
    
    if (result.success) {
      // 로그인 성공 처리
      navigate('/dashboard');
    }
  };
  
  return (
    <div>
      {error && <div>{error}</div>}
      <button onClick={onLogin} disabled={isLoading}>
        {isLoading ? '로딩 중...' : '로그인'}
      </button>
    </div>
  );
}
```

**주요 기능**:
- 로그인 처리 (`handleLogin`)
- 회원가입 처리 (`handleSignUp`)
- 자동 토큰 저장 (localStorage)
- 로딩 상태 관리
- 에러 처리 및 토스트 알림

---

## 노래 데이터 관련 훅

### `useSongs`

모든 노래 목록을 가져오는 훅입니다.

**위치**: `src/hooks/useSongs.ts`

**반환값**:
```typescript
{
  songs: Song[];
  loading: boolean;
  error: string | null;
}
```

**사용 예시**:
```typescript
import { useSongs } from '../hooks/useSongs';

function SongList() {
  const { songs, loading, error } = useSongs();
  
  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  
  return (
    <div>
      {songs.map(song => (
        <div key={song.songId}>{song.title}</div>
      ))}
    </div>
  );
}
```

### `useSong`

특정 노래의 정보를 가져오는 훅입니다.

**위치**: `src/hooks/useSongs.ts`

**파라미터**:
- `songId: number | null` - 노래 ID

**반환값**:
```typescript
{
  song: Song | null;
  loading: boolean;
  error: string | null;
}
```

**사용 예시**:
```typescript
import { useSong } from '../hooks/useSongs';

function SongDetail({ songId }: { songId: number }) {
  const { song, loading, error } = useSong(songId);
  
  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!song) return <div>노래를 찾을 수 없습니다.</div>;
  
  return (
    <div>
      <h1>{song.title}</h1>
      <p>{song.singer}</p>
    </div>
  );
}
```

### `useSongLyricLines`

특정 노래의 가사 소절을 가져오는 훅입니다.

**위치**: `src/hooks/useSongs.ts`

**파라미터**:
- `songId: number | null` - 노래 ID

**반환값**:
```typescript
{
  lyricData: SongWithLyrics | null;
  loading: boolean;
  error: string | null;
}
```

**사용 예시**:
```typescript
import { useSongLyricLines } from '../hooks/useSongs';

function LyricPractice({ songId }: { songId: number }) {
  const { lyricData, loading, error } = useSongLyricLines(songId);
  
  if (loading) return <div>가사 로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  
  return (
    <div>
      <h2>{lyricData?.title}</h2>
      {lyricData?.lyrics.map(line => (
        <div key={line.lyricLineId}>{line.originalText}</div>
      ))}
    </div>
  );
}
```

---

## 캘리브레이션 관련 훅

### `useCalibrationData`

사용자의 캘리브레이션 데이터를 서버에서 로드하는 훅입니다.

**위치**: `src/hooks/useCalibration.ts`

**반환값**:
```typescript
{
  data: CalibrationDataResponse | null;
  loading: boolean;
  error: string | null;
}
```

**사용 예시**:
```typescript
import { useCalibrationData } from '../hooks/useCalibration';

function AppRouter() {
  const { loading } = useCalibrationData();
  
  if (loading) {
    return <div>사용자 데이터 로딩 중...</div>;
  }
  
  return <Routes>...</Routes>;
}
```

**주요 기능**:
- 앱 시작 시 자동으로 캘리브레이션 데이터 로드
- localStorage에 자동 저장 (`target_vowels`, `vowel_calibration`)
- 404 에러는 정상 처리 (캘리브레이션 데이터가 없는 경우)
- 401 에러 처리 (인증 만료)

---

## 발음 평가 관련 훅

### `usePronunciationCheck`

녹음된 오디오를 기반으로 발음 정확도를 평가하는 훅입니다.

**위치**: `src/hooks/usePronunciationCheck.ts`

**파라미터**:
- `titleToEvaluate: string` - 평가할 텍스트 (제목)

**반환값**:
```typescript
{
  isLoading: boolean;
  score: number | null;
  error: string | null;
}
```

**사용 예시**:
```typescript
import { usePronunciationCheck } from '../hooks/usePronunciationCheck';

function PracticeComponent() {
  const { isLoading, score, error } = usePronunciationCheck('안녕하세요');
  
  return (
    <div>
      {isLoading && <div>평가 중...</div>}
      {score !== null && (
        <div>발음 점수: {score}</div>
      )}
      {error && <div>에러: {error}</div>}
    </div>
  );
}
```

**주요 기능**:
- `RecordingContext`의 `recordedAudioBlob`을 자동으로 감지
- 오디오를 Base64로 변환하여 API에 전송
- 발음 정확도 점수 반환 (0.0 ~ 1.0)
- 녹음 시작 시 자동으로 점수 초기화
- 평가할 텍스트 변경 시 자동으로 점수 초기화

**의존성**:
- `RecordingContext`에서 `recordedAudioBlob`, `isRecording` 사용

---

## UI 오버레이 관련 훅

### `useVowelOverlay`

모음 발음 학습을 위한 오버레이를 캔버스에 그리는 훅입니다.

**위치**: `src/hooks/useVowelOverlay.ts`

**파라미터**:
- `currentVowel: string | null` - 현재 표시할 모음

**반환값**:
```typescript
{
  renderOverlay: (
    canvasCtx: CanvasRenderingContext2D,
    toCanvas: (p: LandmarkPoint) => { x: number; y: number },
    allLandmarks: LandmarkPoint[],
    cachedResultsRef: React.MutableRefObject<any>,
    timeSinceLastDetection: number
  ) => void;
  currentVowel: string | null;
}
```

**사용 예시**:
```typescript
import { useVowelOverlay } from '../hooks/useVowelOverlay';

function CameraComponent() {
  const { renderOverlay, currentVowel } = useVowelOverlay('ㅏ');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cachedResultsRef = useRef<any>({});
  
  const drawFrame = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    // 랜드마크 감지 후...
    const allLandmarks = detectLandmarks();
    const timeSinceLastDetection = performance.now() - lastDetectionTime;
    
    renderOverlay(
      ctx,
      (p) => ({ x: p.x, y: p.y }),
      allLandmarks,
      cachedResultsRef,
      timeSinceLastDetection
    );
  };
  
  return <canvas ref={canvasRef} />;
}
```

**주요 기능**:
- 목표 모음의 입술 랜드마크 계산
- 캔버스에 입술 윤곽선 그리기
- 캔버스에 모음 라벨 그리기
- 성능 최적화를 위한 캐싱 (8ms 이상 경과 시에만 재계산)

**내부 동작**:
1. `TargetLandmarksComputer`를 사용하여 목표 랜드마크 계산
2. `drawTargetMouthContours`로 입술 윤곽선 그리기
3. `drawVowelLabel`로 모음 라벨 텍스트 그리기
4. 캐시를 활용하여 불필요한 재계산 방지

---

## 훅 사용 가이드라인

### 1. API 호출 훅 사용

API 호출이 필요한 경우, 직접 API 함수를 호출하지 말고 해당하는 커스텀 훅을 사용하세요.

**❌ 나쁜 예**:
```typescript
function Component() {
  const [songs, setSongs] = useState([]);
  
  useEffect(() => {
    getSongs().then(setSongs);
  }, []);
}
```

**✅ 좋은 예**:
```typescript
function Component() {
  const { songs, loading, error } = useSongs();
}
```

### 2. 로딩 상태 처리

모든 데이터 페칭 훅은 `loading` 상태를 제공합니다. UI에서 적절히 처리하세요.

```typescript
const { songs, loading, error } = useSongs();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <SongList songs={songs} />;
```

### 3. 에러 처리

훅에서 반환하는 `error`를 활용하여 사용자에게 적절한 피드백을 제공하세요.

### 4. 조건부 렌더링

훅이 `null`을 반환할 수 있는 경우 (예: `song`, `lyricData`), 항상 null 체크를 수행하세요.

---

## 새로운 훅 추가하기

새로운 훅을 추가할 때 다음 사항을 고려하세요:

1. **단일 책임 원칙**: 각 훅은 하나의 명확한 목적을 가져야 합니다.
2. **재사용성**: 여러 컴포넌트에서 사용할 수 있어야 합니다.
3. **상태 관리**: 로딩, 에러 상태를 포함해야 합니다.
4. **타입 안정성**: TypeScript 타입을 명확히 정의하세요.
5. **문서화**: JSDoc 주석을 추가하여 사용법을 명확히 하세요.

**훅 템플릿**:
```typescript
/**
 * 훅 설명
 * 
 * @param param - 파라미터 설명
 * @returns 반환값 설명
 */
export function useCustomHook(param: ParamType) {
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 로직 구현
  }, [param]);

  return { data, loading, error };
}
```

---

## 관련 파일

- API 함수: `src/api/`
- 타입 정의: 각 API 디렉토리의 `types.ts`
- 사용 예시: `src/pages/` 디렉토리의 컴포넌트들

