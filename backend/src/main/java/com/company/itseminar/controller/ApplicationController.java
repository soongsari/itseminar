package com.company.itseminar.controller;

import com.company.itseminar.dto.SeminarApplicationDto;
import com.company.itseminar.entity.Seminar;
import com.company.itseminar.entity.SeminarApplication;
import com.company.itseminar.entity.User;
import com.company.itseminar.repository.SeminarApplicationRepository;
import com.company.itseminar.repository.SeminarRepository;
import com.company.itseminar.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Applications", description = "세미나 신청 관련 API")
public class ApplicationController {

    @Autowired
    private SeminarApplicationRepository applicationRepository;

    @Autowired
    private SeminarRepository seminarRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @Operation(summary = "세미나 신청", description = "세미나에 신청합니다")
    public ResponseEntity<Map<String, Object>> applySeminar(@RequestBody Map<String, String> request, Authentication authentication) {
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        String seminarId = request.get("seminarId");
        if (seminarId == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "세미나 ID가 필요합니다"));
        }

        UUID seminarUuid = UUID.fromString(seminarId);
        Seminar seminar = seminarRepository.findById(seminarUuid)
                .orElseThrow(() -> new RuntimeException("세미나를 찾을 수 없습니다"));

        // 이미 신청했는지 확인
        if (applicationRepository.existsByUserAndSeminar(currentUser, seminar)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "이미 신청한 세미나입니다"));
        }

        // 세미나가 마감되었는지 확인
        if (seminar.getIsClosed() || seminar.isExpired()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "마감된 세미나입니다"));
        }

        // 신청 생성
        SeminarApplication application = new SeminarApplication(currentUser, seminar);
        applicationRepository.save(application);

        return ResponseEntity.ok(Map.of("success", true, "message", "세미나 신청이 완료되었습니다"));
    }

    @GetMapping("/my")
    @Operation(summary = "내 신청 내역", description = "현재 사용자의 세미나 신청 내역을 조회합니다")
    public ResponseEntity<List<SeminarApplicationDto>> getMyApplications(Authentication authentication) {
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        List<SeminarApplication> applications = applicationRepository.findByUserOrderByAppliedAtDesc(currentUser);
        List<SeminarApplicationDto> applicationDtos = applications.stream()
                .map(SeminarApplicationDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(applicationDtos);
    }

    @DeleteMapping("/{id}/cancel")
    @Operation(summary = "세미나 신청 취소", description = "세미나 신청을 취소합니다 (24시간 전까지만 가능)")
    public ResponseEntity<Map<String, Object>> cancelApplication(@PathVariable UUID id, Authentication authentication) {
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        SeminarApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("신청을 찾을 수 없습니다"));

        // 본인의 신청인지 확인
        if (!application.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "본인의 신청만 취소할 수 있습니다"));
        }

        Seminar seminar = application.getSeminar();

        // 세미나 시작 24시간 전까지만 취소 가능
        if (!seminar.isCancellationAllowed()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "세미나 시작 24시간 전까지만 취소할 수 있습니다"));
        }

        // 이미 마감된 세미나나 지난 세미나는 취소 불가
        if (seminar.getIsClosed() || seminar.isExpired()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "마감된 세미나 또는 지난 세미나는 취소할 수 없습니다"));
        }

        applicationRepository.delete(application);

        return ResponseEntity.ok(Map.of("success", true, "message", "세미나 신청이 취소되었습니다"));
    }
} 