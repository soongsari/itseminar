package com.company.itseminar.config;

import com.company.itseminar.entity.Seminar;
import com.company.itseminar.entity.SeminarApplication;
import com.company.itseminar.entity.User;
import com.company.itseminar.repository.SeminarRepository;
import com.company.itseminar.repository.SeminarApplicationRepository;
import com.company.itseminar.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SeminarRepository seminarRepository;

    @Autowired
    private SeminarApplicationRepository seminarApplicationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 기본 계정만 생성 (관리자/사용자)
        loadUsers();
        
        // 샘플 데이터 생성 비활성화
        // loadSeminars();
        // loadSeminarApplications();
        
        System.out.println("IT Seminar 애플리케이션이 시작되었습니다.");
        System.out.println("기본 계정: admin/admin123 (관리자), user/user123 (일반사용자)");
    }

    private void loadUsers() {
        // 관리자 계정 생성
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User(
                    "admin",
                    passwordEncoder.encode("admin123"),
                    "관리자",
                    "admin@company.com",
                    "IT팀",
                    User.Role.ADMIN
            );
            userRepository.save(admin);
            System.out.println("관리자 계정이 생성되었습니다: admin/admin123");
        }

        // 일반 사용자 계정 생성
        if (!userRepository.existsByUsername("user")) {
            User user = new User(
                    "user",
                    passwordEncoder.encode("user123"),
                    "일반사용자",
                    "user@company.com",
                    "개발팀",
                    User.Role.USER
            );
            userRepository.save(user);
            System.out.println("일반 사용자 계정이 생성되었습니다: user/user123");
        }

        // 추가 테스트 사용자들 생성
        createUserIfNotExists("kim.minho", "김민호", "kim.minho@company.com", "개발팀");
        createUserIfNotExists("lee.jisoo", "이지수", "lee.jisoo@company.com", "QA팀");
        createUserIfNotExists("park.yunho", "박윤호", "park.yunho@company.com", "디자인팀");
        createUserIfNotExists("choi.soyeon", "최소연", "choi.soyeon@company.com", "기획팀");
        createUserIfNotExists("jung.jihyun", "정지현", "jung.jihyun@company.com", "마케팅팀");
    }

    private void createUserIfNotExists(String username, String fullName, String email, String department) {
        if (!userRepository.existsByUsername(username)) {
            User user = new User(
                    username,
                    passwordEncoder.encode("password123"),
                    fullName,
                    email,
                    department,
                    User.Role.USER
            );
            userRepository.save(user);
            System.out.println("사용자 계정이 생성되었습니다: " + username + "/password123");
        }
    }

    private void loadSeminars() {
        // 이미 세미나가 있다면 샘플 데이터 생성하지 않음
        if (seminarRepository.count() > 0) {
            return;
        }

        User admin = userRepository.findByUsername("admin").orElse(null);
        if (admin == null) {
            return;
        }

        // 미래 세미나들
        createSeminar(admin, "Spring Boot 3.x 신기능 소개", 
                "Spring Boot 3.x의 주요 신기능과 마이그레이션 가이드를 소개합니다.", 
                LocalDateTime.now().plusDays(7), "회의실 A");

        createSeminar(admin, "React 18 업데이트 및 새로운 기능", 
                "React 18의 Concurrent Features와 Suspense의 새로운 활용법을 알아봅니다.", 
                LocalDateTime.now().plusDays(10), "회의실 B");

        createSeminar(admin, "데이터베이스 최적화 전략", 
                "PostgreSQL과 MySQL의 성능 튜닝 기법과 인덱스 최적화 방법을 다룹니다.", 
                LocalDateTime.now().plusDays(14), "대회의실");

        createSeminar(admin, "Docker & Kubernetes 실무 활용", 
                "컨테이너 기술의 실제 프로젝트 적용 사례와 베스트 프랙티스를 공유합니다.", 
                LocalDateTime.now().plusDays(21), "회의실 A");

        createSeminar(admin, "클린 코드와 리팩토링", 
                "읽기 좋은 코드 작성법과 효과적인 리팩토링 기법을 실습합니다.", 
                LocalDateTime.now().plusDays(28), "회의실 C");

        // 진행 중인 세미나 (오늘)
        createSeminar(admin, "AI 개발 동향과 ChatGPT API 활용", 
                "최신 AI 기술 동향과 ChatGPT API를 활용한 애플리케이션 개발 방법을 소개합니다.", 
                LocalDateTime.now().plusHours(3), "대회의실");

        // 과거 세미나들 (자동으로 마감됨)
        createSeminar(admin, "Git Advanced 워크플로우", 
                "Git의 고급 기능과 효율적인 브랜치 전략을 배웠습니다.", 
                LocalDateTime.now().minusDays(3), "회의실 B");

        createSeminar(admin, "REST API 설계 원칙", 
                "RESTful API 설계의 베스트 프랙티스와 보안 고려사항을 다뤘습니다.", 
                LocalDateTime.now().minusDays(7), "회의실 A");

        createSeminar(admin, "테스트 주도 개발(TDD) 실습", 
                "TDD의 핵심 개념과 실제 프로젝트 적용 방법을 실습했습니다.", 
                LocalDateTime.now().minusDays(14), "회의실 C");

        System.out.println("샘플 세미나 데이터가 생성되었습니다.");
    }

    private void createSeminar(User admin, String title, String description, LocalDateTime date, String location) {
        Seminar seminar = new Seminar(title, description, date, location, admin);
        seminarRepository.save(seminar);
    }

    private void loadSeminarApplications() {
        // 이미 신청 데이터가 있다면 생성하지 않음
        if (seminarApplicationRepository.count() > 0) {
            return;
        }

        // 사용자들 조회
        User user = userRepository.findByUsername("user").orElse(null);
        User kimMinho = userRepository.findByUsername("kim.minho").orElse(null);
        User leeJisoo = userRepository.findByUsername("lee.jisoo").orElse(null);
        User parkYunho = userRepository.findByUsername("park.yunho").orElse(null);
        User choiSoyeon = userRepository.findByUsername("choi.soyeon").orElse(null);

        // 세미나들 조회
        var seminars = seminarRepository.findAll();
        
        if (seminars.isEmpty() || user == null) {
            return;
        }

        // 미래 세미나들에 대한 신청 데이터 생성
        for (int i = 0; i < Math.min(5, seminars.size()); i++) {
            Seminar seminar = seminars.get(i);
            
            // 미래 세미나에만 신청 가능
            if (seminar.getDate().isAfter(LocalDateTime.now())) {
                // 기본 사용자 신청
                if (user != null) {
                    createApplicationIfNotExists(user, seminar);
                }
                
                // 다른 사용자들도 랜덤하게 신청
                if (kimMinho != null && i % 2 == 0) {
                    createApplicationIfNotExists(kimMinho, seminar);
                }
                if (leeJisoo != null && i % 3 == 0) {
                    createApplicationIfNotExists(leeJisoo, seminar);
                }
                if (parkYunho != null && i % 2 == 1) {
                    createApplicationIfNotExists(parkYunho, seminar);
                }
                if (choiSoyeon != null && i % 3 == 1) {
                    createApplicationIfNotExists(choiSoyeon, seminar);
                }
            }
        }

        System.out.println("샘플 세미나 신청 데이터가 생성되었습니다.");
    }

    private void createApplicationIfNotExists(User user, Seminar seminar) {
        if (!seminarApplicationRepository.existsByUserAndSeminar(user, seminar)) {
            SeminarApplication application = new SeminarApplication(user, seminar);
            seminarApplicationRepository.save(application);
        }
    }
} 