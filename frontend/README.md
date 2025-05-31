# IT 세미나 시스템 - Frontend

Next.js 14.x와 TypeScript로 구현된 IT 세미나 신청 시스템의 프론트엔드입니다.

## 🛠️ 기술 스택

- **Framework**: Next.js 14.x (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Package Manager**: npm

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # 글로벌 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈페이지 (로그인 리디렉션)
│   ├── login/             # 로그인 페이지
│   └── seminars/          # 세미나 관련 페이지
├── lib/                   # 유틸리티 라이브러리
│   └── api.ts            # API 클라이언트
└── types/                 # TypeScript 타입 정의
    └── index.ts
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버는 `http://localhost:3000`에서 실행됩니다.

### 3. 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 🔧 설정

### API 프록시

개발 환경에서 백엔드 API 호출을 위해 `next.config.js`에서 프록시 설정이 되어 있습니다:

```javascript
// /api/* → http://localhost:8080/api/*
```

### Tailwind CSS

Tailwind CSS가 사전 설정되어 있으며, 다음과 같은 커스텀 클래스들이 정의되어 있습니다:

```css
.btn-primary    /* 기본 버튼 스타일 */
/* 기본 버튼 스타일 */
.btn-secondary  /* 보조 버튼 스타일 */
.input-field; /* 입력 필드 스타일 */
```

## 📱 주요 페이지

### 1. 로그인 페이지 (`/login`)

- 사용자 인증
- 테스트 계정 안내

### 2. 세미나 목록 (`/seminars`)

- 전체 세미나 목록 조회
- 세미나 카드 형태로 표시
- 관리자: 세미나 등록 버튼
- 사용자 정보 및 로그아웃

### 3. 세미나 상세 (`/seminars/[id]`)

- 세미나 상세 정보
- 신청/취소 기능
- 첨부파일 다운로드

### 4. 세미나 등록 (`/seminars/create`)

- 관리자 전용
- 세미나 정보 입력 폼

## 🔒 인증 & 권한

### 인증 플로우

1. 로그인 → 세션 기반 인증
2. API 요청 시 자동으로 쿠키 포함
3. 401 응답 시 로그인 페이지로 리디렉션

### 권한 관리

- **USER**: 세미나 조회, 신청, 취소
- **ADMIN**: 모든 USER 권한 + 세미나 관리

## 📡 API 연동

### API 클라이언트 (`src/lib/api.ts`)

```typescript
// 인증 API
authAPI.login(credentials);
authAPI.logout();
authAPI.getCurrentUser();

// 세미나 API
seminarAPI.getAllSeminars();
seminarAPI.getSeminar(id);
seminarAPI.createSeminar(data);

// 신청 API
applicationAPI.applySeminar(seminarId);
applicationAPI.getMyApplications();
applicationAPI.cancelApplication(id);
```

## 🎨 UI/UX 가이드

### 디자인 시스템

- **Primary Color**: Blue (#3b82f6)
- **Typography**: 기본 시스템 폰트
- **Layout**: 반응형 그리드 시스템

### 컴포넌트 상태

- **Loading**: 스피너 애니메이션
- **Error**: 빨간색 경고 메시지
- **Success**: 녹색 성공 메시지

## 🔍 타입 정의

주요 타입들이 `src/types/index.ts`에 정의되어 있습니다:

- `User`: 사용자 정보
- `Seminar`: 세미나 정보
- `SeminarApplication`: 세미나 신청 정보
- `LoginRequest/Response`: 로그인 관련

## 🧪 개발 도구

### ESLint

```bash
npm run lint
```

### TypeScript 타입 체크

```bash
npx tsc --noEmit
```

## 🚫 제약 사항

- ❌ 외부 CDN 사용 금지
- ❌ 외부 API 호출 금지
- ✅ 완전한 오프라인 환경 지원

## 📱 반응형 지원

- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px
- **Mobile**: 320px - 767px

## 🔄 상태 관리

현재는 컴포넌트 레벨의 useState를 사용하고 있습니다. 필요시 다음과 같은 상태 관리 라이브러리 도입을 고려할 수 있습니다:

- Zustand (권장)
- Redux Toolkit
- SWR/React Query
