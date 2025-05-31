# IT 세미나 신청 시스템

## 📖 프로젝트 개요

사내 IT 세미나 신청을 위한 웹 애플리케이션입니다. 관리자가 세미나를 등록하고, 직원들이 세미나에 신청할 수 있는 시스템입니다.

**✅ 개발 완료 상태** - Docker 컨테이너화를 통한 사내 배포 준비 완료

## 🏗️ 아키텍처

```
📁 프로젝트 구조
├── 📁 backend/     # Spring Boot 3.2.0 (Java 17)
├── 📁 frontend/    # Next.js 14.0.0 (React 18.x)
├── 📁 deploy/      # Docker 배포 패키지 (644MB)
└── 📄 문서들       # README, 설치가이드, 배포가이드
```

## 🛠️ 기술 스택

### Backend

- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Build Tool**: Maven
- **Database**: PostgreSQL 15.x
- **ORM**: Hibernate 6.x (JPA)
- **Security**: Spring Security (Session 기반)
- **Documentation**: Swagger (OpenAPI 3)

### Frontend

- **Framework**: Next.js 14.0.0 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

### 배포

- **컨테이너**: Docker + Docker Compose
- **웹서버**: Nginx (리버스 프록시)
- **배포 방식**: 완전 오프라인 환경 지원

## 🚀 빠른 시작

### 🐳 Docker 배포 (권장)

**사내 환경에서 원클릭 배포**

```bash
# Windows 환경
deploy\scripts\load-images.bat
deploy\scripts\start-services.bat

# Linux 환경
./deploy/scripts/load-images.sh
./deploy/scripts/start-services.sh
```

**접속 정보:**

- 메인 사이트: http://localhost
- API 문서: http://localhost/swagger-ui.html

### 💻 개발 환경 설정

개발 환경에서 직접 실행하려면 [SETUP_GUIDE.md](SETUP_GUIDE.md)를 참조하세요.

#### 사전 요구사항

- Java 17+
- Node.js 18.x LTS
- PostgreSQL 15.x
- Maven

#### 개발 서버 실행

```bash
# 1. 데이터베이스 생성
psql -U postgres -c "CREATE DATABASE itseminar;"

# 2. 백엔드 실행
cd backend
./mvnw spring-boot:run

# 3. 프론트엔드 실행 (새 터미널)
cd frontend
npm install
npm run dev
```

## 🔑 기본 계정

### 관리자 계정

- **ID**: admin
- **Password**: admin123
- **권한**: 세미나 관리, 카테고리 관리, 대시보드

### 일반 사용자 계정

- **ID**: user
- **Password**: user123
- **권한**: 세미나 조회 및 신청

### 추가 테스트 계정들

모든 계정의 비밀번호: `password123`

- kim.minho (개발팀)
- lee.jisoo (QA팀)
- park.yunho (디자인팀)
- choi.soyeon (기획팀)
- jung.jihyun (마케팅팀)

## 📋 완성된 주요 기능

### 👤 사용자 기능 ✅

- ✅ 로그인/로그아웃 (Spring Security)
- ✅ 세미나 목록 조회 (카테고리별 필터링)
- ✅ 세미나 상세 정보 확인
- ✅ 세미나 신청 및 취소 (24시간 전까지)
- ✅ 신청 내역 조회
- ✅ 파일 다운로드

### 🔧 관리자 기능 ✅

- ✅ 세미나 등록/수정/삭제
- ✅ 다중 파일 업로드 (PostgreSQL BLOB)
- ✅ 카테고리 관리
- ✅ 신청자 목록 조회
- ✅ 관리 대시보드 (통계)
- ✅ QR 코드 생성 (출석용)

### ⚙️ 시스템 기능 ✅

- ✅ 자동 마감 처리 (세미나 시작 시간 경과)
- ✅ 권한 기반 접근 제어 (ROLE_USER, ROLE_ADMIN)
- ✅ 반응형 웹 디자인 (Tailwind CSS)
- ✅ API 문서 자동화 (Swagger UI)

### 🚧 부분 구현된 기능

- 🚧 QR 코드 출석 시스템 (생성 완료, 스캔 기능 미완성)
- 🚧 알림 시스템 (기본 구조만 구현)

## 🌐 API 문서

실행 중인 백엔드에서 Swagger UI로 API 문서를 확인할 수 있습니다:

- **개발 환경**: `http://localhost:8080/swagger-ui.html`
- **Docker 환경**: `http://localhost/swagger-ui.html`

### 주요 API 엔드포인트

#### 인증

- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보
- `POST /api/auth/logout` - 로그아웃

#### 세미나

- `GET /api/seminars` - 세미나 목록 (카테고리 필터링 지원)
- `POST /api/seminars` - 세미나 등록 (관리자)
- `GET /api/seminars/{id}` - 세미나 상세

#### 신청

- `POST /api/applications` - 세미나 신청
- `GET /api/applications/my` - 내 신청 내역
- `DELETE /api/applications/{id}/cancel` - 신청 취소

#### 카테고리

- `GET /api/categories` - 카테고리 목록
- `POST /api/categories` - 카테고리 생성 (관리자)

## 📊 데이터베이스 ERD

### 주요 테이블

#### Users (사용자) ✅

- id (UUID, PK)
- username (String, Unique)
- password (String, BCrypt)
- full_name (String)
- email (String)
- department (String)
- role (ENUM: USER/ADMIN)
- created_at (Timestamp)

#### Seminars (세미나) ✅

- id (UUID, PK)
- title (String)
- description (Text)
- seminar_date (Timestamp)
- location (String)
- is_closed (Boolean)
- category_id (UUID, FK → Categories)
- created_by (UUID, FK → Users)
- created_at (Timestamp)

#### Categories (카테고리) ✅

- id (UUID, PK)
- name (String)
- description (Text)
- created_at (Timestamp)

#### SeminarApplications (세미나 신청) ✅

- id (UUID, PK)
- user_id (UUID, FK → Users)
- seminar_id (UUID, FK → Seminars)
- applied_at (Timestamp)

#### FileAttachments (파일 첨부) ✅

- id (UUID, PK)
- seminar_id (UUID, FK → Seminars)
- file_name (String)
- content_type (String)
- file_size (Long)
- file_data (BLOB)
- uploaded_at (Timestamp)

#### Attendances (출석 - 부분 구현) 🚧

- id (UUID, PK)
- user_id (UUID, FK → Users)
- seminar_id (UUID, FK → Seminars)
- qr_code (String)
- attended_at (Timestamp)
- status (Enum)

## 🐳 Docker 배포

### 배포 패키지 구성 (644MB)

```
deploy/
├── 📦 images/              # Docker 이미지 파일들
│   ├── itseminar-backend.tar    (138MB)
│   ├── itseminar-frontend.tar   (352MB)
│   ├── postgres-15-alpine.tar   (104MB)
│   └── nginx-alpine.tar         (20MB)
├── 🛠️ scripts/            # 자동 배포 스크립트
│   ├── load-images.bat/.sh     # 이미지 로드
│   └── start-services.bat/.sh  # 서비스 시작
├── ⚙️ nginx/              # Nginx 설정
├── 📄 docker-compose.yml   # 컨테이너 오케스트레이션
└── 📖 DEPLOYMENT_GUIDE.md  # 상세 배포 가이드
```

### 배포 특징

- **🔒 완전 오프라인**: 외부 인터넷 연결 불필요
- **📦 올인원 패키지**: 모든 의존성 포함
- **🤖 자동화**: 원클릭 설치 스크립트
- **🔧 유지보수 편의**: Docker 기반 관리

## 🔒 보안 및 인증

- **인증 방식**: Session 기반 인증
- **권한 관리**: Role-based Access Control (RBAC)
- **비밀번호 암호화**: BCrypt
- **CORS 설정**: 개발 환경 대응
- **파일 저장**: PostgreSQL BLOB (외부 저장소 미사용)

## 🚫 제약 사항

### 외부 의존성 금지 ✅

- ❌ 외부 API 호출 금지
- ❌ 외부 CDN 사용 금지
- ❌ 클라우드 서비스 사용 금지
- ✅ 완전한 오프라인 환경 지원
- ✅ 사내망에서 독립적으로 동작

### 비즈니스 규칙 ✅

- 세미나 신청 취소는 시작 24시간 전까지만 가능
- 세미나 시작 시간이 지나면 자동으로 마감 처리
- 중복 신청 불가
- 관리자만 세미나 및 카테고리 관리 가능

## 📋 향후 개발 계획 (인턴 과제)

### 1. QR 코드 출석 시스템 완성 (우선순위 1)

- QR 코드 스캔 기능 구현
- 출석 상태 관리 UI
- 출석 통계 기능

### 2. 실시간 알림 시스템 (우선순위 2)

- WebSocket 또는 Server-Sent Events 구현
- 세미나 알림, 신청 확인 알림

### 3. 고급 검색 및 필터링 (우선순위 3)

- 전문 검색 기능
- 다중 조건 필터링
- 검색 결과 하이라이팅

### 4. 통계 및 리포트 기능 확장 (우선순위 4)

- 세미나 참석률 분석
- 사용자 활동 통계
- Excel 리포트 생성

## 🧪 테스트

```bash
# 백엔드 테스트
cd backend
mvn test

# 프론트엔드 테스트
cd frontend
npm run test
```

## 📚 문서

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - 개발 환경 설정
- [deploy/DEPLOYMENT_GUIDE.md](deploy/DEPLOYMENT_GUIDE.md) - 사내 배포 가이드
- [deploy/README.md](deploy/README.md) - 배포 패키지 빠른 시작

## 📞 지원

- **GitHub Repository**: https://github.com/soongsari/itseminar.git
- **API 문서**: Swagger UI에서 실시간 확인 가능
- **개발 가이드**: `.cursor/rules/developrules.mdc` 참조

---

**🎉 배포 완료!**

이제 IT 세미나 시스템을 어떤 사내 환경에서도 쉽게 배포하고 사용할 수 있습니다!
