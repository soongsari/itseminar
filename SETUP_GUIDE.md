# IT 세미나 신청 시스템 - 설치 및 실행 가이드

## 📂 GitHub 저장소

**GitHub Repository**: https://github.com/soongsari/itseminar.git

### 프로젝트 클론

```powershell
# Git으로 프로젝트 클론
git clone https://github.com/soongsari/itseminar.git
cd itseminar
```

## 🎯 설치 완료 확인

다음 명령어들이 정상적으로 작동하면 설치가 완료된 것입니다:

```powershell
# Java 확인
java -version
# 출력: openjdk version "17.0.15" 2025-04-15 LTS

# Node.js 확인
node --version
# 출력: v22.16.0

# npm 확인
npm --version
# 출력: 10.9.2

# PostgreSQL 확인
psql --version
# 출력: psql (PostgreSQL) 15.13
```

## 📁 프로젝트 구조

```
ITSeminar/
├── 📁 backend/     # Spring Boot 3.2.x (Java 17)
├── 📁 frontend/    # Next.js 14.x (React 18.x)
├── README.md
└── SETUP_GUIDE.md
```

## 🚀 실행 방법

### 1. PostgreSQL 데이터베이스 설정

#### 1-1. PostgreSQL 서비스 시작

```powershell
# Windows 서비스에서 PostgreSQL 시작
net start postgresql-x64-15
```

#### 1-2. 데이터베이스 생성

```powershell
# PostgreSQL 서비스 시작 확인
net start postgresql-x64-15

# 환경변수로 비밀번호 설정 후 데이터베이스 생성
$env:PGPASSWORD="postgres"
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE itseminar;"

# 또는 PgAdmin을 사용하여 GUI로 생성
# 1. PgAdmin 실행
# 2. postgres 서버 연결
# 3. 우클릭 > Create > Database
# 4. 데이터베이스명: itseminar
```

**⚠️ 주의사항:**

- PostgreSQL 15가 기본 경로에 설치되어 있어야 합니다
- postgres 계정의 비밀번호가 "postgres"로 설정되어 있어야 합니다
- 만약 다른 비밀번호를 사용한다면 `application.yml`에서 수정하세요

### 2. 백엔드 실행

```powershell
# 백엔드 디렉토리로 이동
cd backend

# JAVA_HOME 환경변수 설정
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.15.6-hotspot"

# Spring Boot 애플리케이션 실행
.\mvnw.cmd spring-boot:run
```

**백엔드 실행 확인:**

- 브라우저에서 `http://localhost:8080` 접속
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. 프론트엔드 실행

새 터미널 창에서:

```powershell
# 프론트엔드 디렉토리로 이동
cd frontend

# 개발 서버 실행
npm run dev
```

**프론트엔드 실행 확인:**

- 브라우저에서 `http://localhost:3000` 접속

## 🔑 기본 계정

### 관리자 계정

- **ID**: admin
- **Password**: admin123
- **권한**: 세미나 등록/수정/삭제, 신청자 관리

### 일반 사용자 계정

- **ID**: user
- **Password**: user123
- **권한**: 세미나 조회/신청

### 추가 테스트 계정들

모든 테스트 계정의 비밀번호는 `password123`입니다:

- **kim.minho** - 김민호 (개발팀)
- **lee.jisoo** - 이지수 (QA팀)
- **park.yunho** - 박윤호 (디자인팀)
- **choi.soyeon** - 최소연 (기획팀)
- **jung.jihyun** - 정지현 (마케팅팀)

## 📊 샘플 데이터

애플리케이션 첫 실행 시 자동으로 생성되는 샘플 데이터:

### 세미나 데이터

**미래 세미나 (신청 가능):**

- Spring Boot 3.x 신기능 소개 (7일 후)
- React 18 업데이트 및 새로운 기능 (10일 후)
- 데이터베이스 최적화 전략 (14일 후)
- Docker & Kubernetes 실무 활용 (21일 후)
- 클린 코드와 리팩토링 (28일 후)

**진행 중인 세미나:**

- AI 개발 동향과 ChatGPT API 활용 (오늘)

**과거 세미나 (마감):**

- Git Advanced 워크플로우
- REST API 설계 원칙
- 테스트 주도 개발(TDD) 실습

### 신청 데이터

테스트 사용자들이 미래 세미나에 다양하게 신청한 상태로 설정되어 있어, 신청자 관리 기능을 바로 테스트할 수 있습니다.

## 🛠️ 트러블슈팅

### 1. PostgreSQL 연결 오류

```
Error: could not connect to server
```

**해결방법:**

1. PostgreSQL 서비스가 실행 중인지 확인
2. `application.yml`의 데이터베이스 설정 확인
3. 방화벽에서 5432 포트 허용

### 2. JAVA_HOME 오류

```
Error: JAVA_HOME not found
```

**해결방법:**

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.15.6-hotspot"
```

### 3. 포트 충돌

```
Port 8080 is already in use
```

**해결방법:**

1. 실행 중인 프로세스 종료
2. 또는 `application.yml`에서 포트 변경:

```yaml
server:
  port: 8081
```

### 4. npm 의존성 오류

```
Error: Cannot find module
```

**해결방법:**

```powershell
cd frontend
npm install
```

## 📊 데이터베이스 초기화

애플리케이션 첫 실행 시 자동으로:

1. 테이블 생성
2. 기본 사용자 계정 생성
3. 샘플 데이터 생성

수동 초기화가 필요한 경우:

```sql
-- 테이블 삭제 후 재생성
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

## 🔧 개발 환경 설정

### VS Code 추천 확장

- **백엔드**: Extension Pack for Java, Spring Boot Extension Pack
- **프론트엔드**: ES7+ React/Redux/React-Native snippets, Tailwind CSS IntelliSense

### IntelliJ IDEA 설정

1. JDK 17 설정
2. Maven 자동 임포트 활성화
3. Spring Boot 플러그인 설치

## 📝 주요 API 엔드포인트

### 인증

- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보
- `POST /api/auth/logout` - 로그아웃

### 세미나

- `GET /api/seminars` - 세미나 목록
- `POST /api/seminars` - 세미나 등록 (관리자)
- `GET /api/seminars/{id}` - 세미나 상세

### 신청

- `POST /api/applications` - 세미나 신청
- `GET /api/applications/my` - 내 신청 내역

## 🎯 성능 최적화

### 백엔드

- JVM 옵션: `-Xms512m -Xmx1024m`
- 커넥션 풀: HikariCP (기본 설정)

### 프론트엔드

- 프로덕션 빌드: `npm run build`
- 정적 자원 최적화 적용

## 📧 지원

문제 발생 시:

1. 로그 파일 확인 (`logs/` 디렉토리)
2. 브라우저 개발자 도구 콘솔 확인
3. GitHub Issues에 문의

---

**✅ 설치 완료!**

- 백엔드: http://localhost:8080
- 프론트엔드: http://localhost:3000
- Swagger API 문서: http://localhost:8080/swagger-ui.html
