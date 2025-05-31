# IT 세미나 신청 시스템

## 📖 프로젝트 개요

사내 IT 세미나 신청을 위한 웹 애플리케이션입니다. 관리자가 세미나를 등록하고, 직원들이 세미나에 신청할 수 있는 시스템입니다.

## 🏗️ 아키텍처

```
📁 프로젝트 구조
├── 📁 backend/     # Spring Boot 3.2.x (Java 17)
├── 📁 frontend/    # Next.js 14.x (React 18.x)
└── 📁 common/      # 공통 타입/유틸리티 (선택적)
```

## 🛠️ 기술 스택

### Backend

- **Framework**: Spring Boot 3.2.x
- **Language**: Java 17
- **Build Tool**: Maven
- **Database**: PostgreSQL 15.x
- **ORM**: Hibernate 6.x (JPA)
- **Security**: Spring Security
- **Documentation**: Swagger (OpenAPI 3)

### Frontend

- **Framework**: Next.js 14.x (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

## 🚀 빠른 시작

### 사전 요구사항

- Java 17+
- Node.js 18.x LTS
- PostgreSQL 15.x
- Maven

### 1. 데이터베이스 설정

```sql
-- PostgreSQL에서 데이터베이스 생성
CREATE DATABASE itseminar;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE itseminar TO postgres;
```

### 2. 백엔드 실행

```bash
cd backend
mvn spring-boot:run
```

백엔드는 `http://localhost:8080`에서 실행됩니다.

### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

## 🔑 기본 계정

### 관리자 계정

- **ID**: admin
- **Password**: admin123

### 일반 사용자 계정

- **ID**: user
- **Password**: user123

## 📋 주요 기능

### 👤 사용자 기능

- ✅ 로그인/로그아웃
- ✅ 세미나 목록 조회
- ✅ 세미나 상세 정보 확인
- ✅ 세미나 신청
- ✅ 신청 내역 조회
- ✅ 신청 취소 (24시간 전까지)

### 🔧 관리자 기능

- ✅ 세미나 등록/수정/삭제
- ✅ 세미나 첨부파일 업로드
- ✅ 신청자 목록 조회
- ✅ 신청자 명단 다운로드

### ⚙️ 시스템 기능

- ✅ 자동 마감 처리 (세미나 시작 시간 경과)
- ✅ 권한 기반 접근 제어
- ✅ 파일 업로드/다운로드 (PostgreSQL BLOB)

## 🌐 API 문서

백엔드 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

- Swagger UI: `http://localhost:8080/swagger-ui.html`

## 📊 데이터베이스 ERD

### 주요 테이블

#### Users (사용자)

- id (UUID, PK)
- username (String, Unique)
- password (String, BCrypt)
- full_name (String)
- email (String)
- department (String)
- role (ENUM: USER/ADMIN)
- created_at (Timestamp)

#### Seminars (세미나)

- id (UUID, PK)
- title (String)
- description (Text)
- seminar_date (Timestamp)
- location (String)
- is_closed (Boolean)
- created_by (UUID, FK → Users)
- created_at (Timestamp)

#### SeminarApplications (세미나 신청)

- id (UUID, PK)
- user_id (UUID, FK → Users)
- seminar_id (UUID, FK → Seminars)
- applied_at (Timestamp)

#### FileAttachments (파일 첨부)

- id (UUID, PK)
- seminar_id (UUID, FK → Seminars)
- file_name (String)
- content_type (String)
- file_size (Long)
- file_data (BLOB)
- uploaded_at (Timestamp)

## 🔒 보안 및 인증

- **인증 방식**: Session 기반 인증
- **권한 관리**: Role-based Access Control (RBAC)
- **비밀번호 암호화**: BCrypt
- **CORS 설정**: 개발 환경 대응

## 🚫 제약 사항

### 외부 의존성 금지

- ❌ 외부 API 호출 금지
- ❌ 외부 CDN 사용 금지
- ❌ 클라우드 서비스 사용 금지
- ✅ 완전한 오프라인 환경 지원

### 비즈니스 규칙

- 세미나 신청 취소는 시작 24시간 전까지만 가능
- 세미나 시작 시간이 지나면 자동으로 마감 처리
- 중복 신청 불가

## 🧪 테스트

```bash
# 백엔드 테스트
cd backend
mvn test

# 프론트엔드 테스트
cd frontend
npm run test
```

## 📝 라이센스

이 프로젝트는 사내 프로젝트로 제작되었습니다.

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request
