package com.company.itseminar.controller;

import com.company.itseminar.repository.CategoryRepository;
import com.company.itseminar.repository.SeminarRepository;
import com.company.itseminar.repository.SeminarApplicationRepository;
import com.company.itseminar.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "관리자 대시보드 API")
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    @Autowired
    private SeminarRepository seminarRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SeminarApplicationRepository seminarApplicationRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping("/stats")
    @Operation(summary = "대시보드 통계", description = "전체 시스템 통계를 조회합니다 (관리자만)")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // 기본 통계
        long totalSeminars = seminarRepository.count();
        long totalUsers = userRepository.count();
        long totalApplications = seminarApplicationRepository.count();
        long totalCategories = categoryRepository.count();
        
        // 현재 진행 중인 세미나 수
        LocalDateTime now = LocalDateTime.now();
        long activeSeminars = seminarRepository.findByOrderByDateDesc().stream()
                .filter(seminar -> seminar.getDate().isAfter(now) && !seminar.getIsClosed())
                .count();
        
        // 오늘 진행되는 세미나 수
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);
        long todaysSeminars = seminarRepository.findByDateBetween(todayStart, todayEnd).size();
        
        // 이번 주 신청 수
        LocalDateTime weekStart = now.minusDays(7);
        long weeklyApplications = seminarApplicationRepository.findByAppliedAtAfter(weekStart).size();
        
        stats.put("totalSeminars", totalSeminars);
        stats.put("totalUsers", totalUsers);
        stats.put("totalApplications", totalApplications);
        stats.put("totalCategories", totalCategories);
        stats.put("activeSeminars", activeSeminars);
        stats.put("todaysSeminars", todaysSeminars);
        stats.put("weeklyApplications", weeklyApplications);
        
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/monthly-stats")
    @Operation(summary = "월별 세미나 통계", description = "월별 세미나 개최 수를 조회합니다 (관리자만)")
    public ResponseEntity<List<Map<String, Object>>> getMonthlySeminarStats() {
        List<Object[]> rawStats = seminarRepository.findMonthlySeminarStats();
        
        List<Map<String, Object>> monthlyStats = rawStats.stream()
                .map(row -> {
                    Map<String, Object> stat = new HashMap<>();
                    stat.put("year", row[0]);
                    stat.put("month", row[1]);
                    stat.put("count", row[2]);
                    return stat;
                })
                .toList();
        
        return ResponseEntity.ok(monthlyStats);
    }
    
    @GetMapping("/category-stats")
    @Operation(summary = "카테고리별 통계", description = "카테고리별 세미나 수를 조회합니다 (관리자만)")
    public ResponseEntity<List<Map<String, Object>>> getCategoryStats() {
        var categories = categoryRepository.findByIsActiveTrueOrderByDisplayOrderAscNameAsc();
        
        List<Map<String, Object>> categoryStats = categories.stream()
                .map(category -> {
                    Map<String, Object> stat = new HashMap<>();
                    stat.put("id", category.getId());
                    stat.put("name", category.getName());
                    stat.put("color", category.getColorCode());
                    stat.put("icon", category.getIconName());
                    stat.put("seminarCount", seminarRepository.countByCategory(category));
                    return stat;
                })
                .toList();
        
        return ResponseEntity.ok(categoryStats);
    }
    
    @GetMapping("/recent-activities")
    @Operation(summary = "최근 활동", description = "최근 세미나 등록 및 신청 활동을 조회합니다 (관리자만)")
    public ResponseEntity<Map<String, Object>> getRecentActivities() {
        Map<String, Object> activities = new HashMap<>();
        
        // 최근 세미나 (최대 10개)
        var recentSeminars = seminarRepository.findByOrderByDateDesc().stream()
                .limit(10)
                .map(seminar -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("id", seminar.getId());
                    activity.put("title", seminar.getTitle());
                    activity.put("date", seminar.getDate());
                    activity.put("location", seminar.getLocation());
                    activity.put("createdBy", seminar.getCreatedBy().getFullName());
                    activity.put("createdAt", seminar.getCreatedAt());
                    activity.put("applicationCount", seminar.getApplications() != null ? 
                            seminar.getApplications().size() : 0);
                    if (seminar.getCategory() != null) {
                        activity.put("categoryName", seminar.getCategory().getName());
                        activity.put("categoryColor", seminar.getCategory().getColorCode());
                    }
                    return activity;
                })
                .toList();
        
        // 최근 신청 (최대 10개)
        var recentApplications = seminarApplicationRepository.findTop10ByOrderByAppliedAtDesc().stream()
                .map(application -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("id", application.getId());
                    activity.put("userName", application.getUser().getFullName());
                    activity.put("userDepartment", application.getUser().getDepartment());
                    activity.put("seminarTitle", application.getSeminar().getTitle());
                    activity.put("seminarId", application.getSeminar().getId());
                    activity.put("appliedAt", application.getAppliedAt());
                    return activity;
                })
                .toList();
        
        activities.put("recentSeminars", recentSeminars);
        activities.put("recentApplications", recentApplications);
        
        return ResponseEntity.ok(activities);
    }
} 