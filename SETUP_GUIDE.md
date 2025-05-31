# IT 세미나 신청 시스템 - 설치 및 실행 가이드

## 📂 GitHub 저장소

**GitHub Repository**: https://github.com/soongsari/itseminar.git

### 프로젝트 클론

```powershell
# Git으로 프로젝트 클론
git clone https://github.com/soongsari/itseminar.git
cd itseminar
```

## 🚀 배포 방법 선택

### 🐳 Docker 배포 (권장 - 사내 환경)

**Docker 배포의 장점:**

- ✅ 완전 오프라인 환경 지원
- ✅ 환경 일관성 보장
- ✅ 원클릭 설치
- ✅ 644MB 패키지로 USB/네트워크 배포 가능

#### Docker 빠른 시작

```powershell
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

**상세한 Docker 배포 가이드는 [deploy/DEPLOYMENT_GUIDE.md](deploy/DEPLOYMENT_GUIDE.md)를 참조하세요.**

---

### 💻 개발 환경 직접 설치

개발자를 위한 로컬 환경 설정 방법입니다.

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
├── 📁 backend/             # Spring Boot 3.2.0 (Java 17)
├── 📁 frontend/            # Next.js 14.0.0 (React 18.x)
├── 📁 deploy/              # Docker 배포 패키지 (644MB)
│   ├── 📁 scripts/         # 자동 배포 스크립트
│   ├── 📁 nginx/           # Nginx 설정
│   ├── docker-compose.yml  # 컨테이너 오케스트레이션
│   └── DEPLOYMENT_GUIDE.md # 배포 가이드
├── README.md               # 프로젝트 개요
└── SETUP_GUIDE.md          # 이 가이드
```

## 🚀 개발 환경 실행 방법

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

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

**프론트엔드 실행 확인:**

- 브라우저에서 `http://localhost:3000` 접속

## 🔑 기본 계정

### 관리자 계정

- **ID**: admin
- **Password**: admin123
- **권한**: 세미나 등록/수정/삭제, 카테고리 관리, 신청자 관리, 대시보드

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

## 📊 완성된 기능과 샘플 데이터

애플리케이션 첫 실행 시 자동으로 생성되는 샘플 데이터:

### ✅ 구현 완료된 기능

#### 사용자 기능

- 로그인/로그아웃 (Spring Security)
- 세미나 목록 조회 (카테고리별 필터링)
- 세미나 상세 조회
- 세미나 신청/취소 (24시간 제한)
- 신청 내역 조회
- 파일 다운로드

#### 관리자 기능

- 세미나 CRUD (다중 파일 업로드 포함)
- 카테고리 관리
- 신청자 목록 조회
- 관리 대시보드 (통계)
- QR 코드 생성 (출석용)

#### 시스템 기능

- 자동 마감 처리
- 권한 기반 접근 제어
- 반응형 웹 디자인
- API 문서 자동화

### 📋 샘플 데이터

#### 카테고리

- 개발 (Development)
- 디자인 (Design)
- 데이터 (Data)
- 보안 (Security)
- 클라우드 (Cloud)

#### 세미나 데이터

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

## 🚧 부분 구현된 기능 (인턴 과제)

### 1. QR 코드 출석 시스템 (우선순위 1)

- ✅ QR 코드 생성 기능
- 🚧 QR 코드 스캔 기능 (미완성)
- 🚧 출석 상태 관리 UI

### 2. 알림 시스템 (우선순위 2)

- 🚧 기본 구조만 구현됨
- 🚧 실시간 알림 기능 필요

### 3. 고급 검색 및 필터링 (우선순위 3)

- ✅ 기본 카테고리 필터링
- 🚧 고급 검색 기능

### 4. 통계 및 리포트 (우선순위 4)

- ✅ 기본 대시보드
- 🚧 상세 통계 및 Excel 내보내기

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

### 5. Docker 관련 문제

Docker 환경에서 문제가 발생하는 경우 [deploy/DEPLOYMENT_GUIDE.md](deploy/DEPLOYMENT_GUIDE.md)의 문제 해결 섹션을 참조하세요.

## 📊 데이터베이스 초기화

애플리케이션 첫 실행 시 자동으로:

1. 테이블 생성 (User, Seminar, Category, SeminarApplication, FileAttachment, Attendance)
2. 기본 사용자 계정 생성
3. 카테고리 데이터 생성
4. 샘플 세미나 데이터 생성

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

- `GET /api/seminars` - 세미나 목록 (카테고리 필터링 지원)
- `POST /api/seminars` - 세미나 등록 (관리자)
- `GET /api/seminars/{id}` - 세미나 상세

### 카테고리

- `GET /api/categories` - 카테고리 목록
- `POST /api/categories` - 카테고리 생성 (관리자)

### 신청

- `POST /api/applications` - 세미나 신청
- `GET /api/applications/my` - 내 신청 내역
- `DELETE /api/applications/{id}/cancel` - 신청 취소

### 출석 (부분 구현)

- `POST /api/attendance/generate-qr/{seminarId}` - QR 코드 생성 (관리자)
- `POST /api/attendance/check-in` - QR 코드 스캔 출석 체크 (미완성)

## 🎯 성능 최적화

### 백엔드

- JVM 옵션: `-Xms512m -Xmx1024m`
- 커넥션 풀: HikariCP (기본 설정)

### 프론트엔드

- 프로덕션 빌드: `npm run build`
- 정적 자원 최적화 적용

## 📚 추가 문서

- [README.md](README.md) - 프로젝트 개요
- [deploy/DEPLOYMENT_GUIDE.md](deploy/DEPLOYMENT_GUIDE.md) - Docker 배포 가이드
- [deploy/README.md](deploy/README.md) - 배포 패키지 빠른 시작
- `.cursor/rules/developrules.mdc` - 개발 규칙 및 상세 기술 명세

## 📧 지원

문제 발생 시:

1. 로그 파일 확인 (`logs/` 디렉토리)
2. 브라우저 개발자 도구 콘솔 확인
3. GitHub Issues에 문의
4. Swagger UI에서 API 테스트

---

**✅ 설치 완료!**

- **개발 환경**:

  - 백엔드: http://localhost:8080
  - 프론트엔드: http://localhost:3000
  - Swagger API 문서: http://localhost:8080/swagger-ui.html

- **Docker 환경**:
  - 메인 사이트: http://localhost
  - API 문서: http://localhost/swagger-ui.html

**🎉 이제 IT 세미나 시스템을 사용할 준비가 완료되었습니다!**
