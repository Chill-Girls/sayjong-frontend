# 스타일 가이드

프로젝트 전체에서 일관된 스타일을 유지하기 위한 통합 스타일 시스템입니다.

## 📁 파일 구조

```
src/styles/
├── theme.ts       # 테마 상수 (색상, 폰트, 간격 등)
├── mixins.ts      # 재사용 가능한 스타일 믹스인
├── common.css     # 공통 CSS 클래스
└── README.md      # 이 파일
```

## 🎨 사용 방법

### 1. TypeScript에서 테마 상수 사용

```typescript
import { COLORS, FONTS, SPACING, FONT_SIZES } from './styles/theme';

const styles = {
  container: {
    backgroundColor: COLORS.background,
    fontFamily: FONTS.primary,
    padding: SPACING.md,
    fontSize: FONT_SIZES.lg,
  }
};
```

### 2. 믹스인 사용 (인라인 스타일)

```typescript
import { flexColumnCenter, buttonPrimary, scaled } from './styles/mixins';

const MyComponent = () => {
  return (
    <div style={{
      ...flexColumnCenter,
      gap: scaled(20),
    }}>
      <button style={{
        ...buttonPrimary,
        padding: scaled(12),
      }}>
        Click me
      </button>
    </div>
  );
};
```

### 3. CSS 클래스 사용

먼저 `main.tsx`에서 import:
```typescript
import './styles/common.css';
```

컴포넌트에서 사용:
```tsx
<div className="container-fullscreen">
  <div className="flex-column-center">
    <h1 className="text-primary font-pretendard">Title</h1>
  </div>
</div>
```

## 🎯 주요 상수

### 색상 (COLORS)
- `primary`: #f04299 (브랜드 핑크)
- `dark`: #313131 (다크 텍스트)
- `background`: #f8f6f7 (메인 배경)
- `white`: #fff
- `lightPink`: #ffe9f4

### 폰트 (FONTS)
- `primary`: Pretendard
- `secondary`: Poppins

### 간격 (SPACING)
- `xs`: 6px
- `sm`: 12px
- `md`: 18px
- `lg`: 30px
- `xl`: 52.5px

### 폰트 크기 (FONT_SIZES)
- `sm`: 10.5px
- `base`: 12px
- `lg`: 18px
- `xl`: 22.5px
- `xxl`: 30px
- `xxxl`: 48px

## 📝 베스트 프랙티스

### ✅ DO
```typescript
// 테마 상수 사용
backgroundColor: COLORS.primary

// 믹스인 사용
style={{ ...flexCenter, gap: SPACING.md }}

// 스케일 헬퍼 사용
padding: scaled(20)
```

### ❌ DON'T
```typescript
// 하드코딩된 값 사용
backgroundColor: '#f04299'

// 매번 같은 스타일 반복
style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}

// 매뉴얼 스케일 계산
padding: '15px'  // 20px × 0.75를 직접 계산
```

## 🔧 헬퍼 함수

### `scaled(value: number): string`
값에 0.75 스케일을 적용합니다.

```typescript
scaled(20)  // '15px'
scaled(40)  // '30px'
```

### `scaledValues(...values: number[]): string`
여러 값에 스케일을 적용합니다.

```typescript
scaledValues(10, 20, 30, 40)  // '7.5px 15px 22.5px 30px'
```

## 🚀 마이그레이션 가이드

기존 인라인 스타일을 새로운 시스템으로 변경:

### Before
```typescript
const styles = {
  container: {
    backgroundColor: '#f8f6f7',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '18px',
  }
};
```

### After
```typescript
import { containerFullscreen } from './styles/mixins';
import { SPACING } from './styles/theme';

const styles = {
  container: {
    ...containerFullscreen,
    padding: SPACING.md,
  }
};
```

## 📚 참고사항

- 모든 크기는 `0.75` 스케일이 적용되어 있습니다
- 새로운 색상이나 상수가 필요하면 `theme.ts`에 추가하세요
- 공통으로 사용되는 스타일은 `mixins.ts`에 추가하세요
- CSS 클래스가 필요하면 `common.css`에 추가하세요

