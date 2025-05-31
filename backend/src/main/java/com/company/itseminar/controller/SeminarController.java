package com.company.itseminar.controller;

import com.company.itseminar.dto.SeminarCreateRequest;
import com.company.itseminar.dto.SeminarDto;
import com.company.itseminar.dto.UserDto;
import com.company.itseminar.entity.Category;
import com.company.itseminar.entity.Seminar;
import com.company.itseminar.entity.SeminarApplication;
import com.company.itseminar.entity.User;
import com.company.itseminar.repository.CategoryRepository;
import com.company.itseminar.repository.SeminarRepository;
import com.company.itseminar.repository.UserRepository;
import com.company.itseminar.repository.SeminarApplicationRepository;
import com.company.itseminar.repository.FileAttachmentRepository;
import com.company.itseminar.dto.FileAttachmentDto;
import com.company.itseminar.entity.FileAttachment;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seminars")
@Tag(name = "Seminars", description = "세미나 관련 API")
public class SeminarController {

    @Autowired
    private SeminarRepository seminarRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SeminarApplicationRepository seminarApplicationRepository;

    @Autowired
    private FileAttachmentRepository fileAttachmentRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    @Operation(summary = "세미나 목록 조회", description = "모든 세미나 목록을 조회합니다")
    public ResponseEntity<List<SeminarDto>> getAllSeminars(Authentication authentication) {
        List<Seminar> seminars = seminarRepository.findByOrderByDateDesc();
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        List<SeminarDto> seminarDtos = seminars.stream()
                .map(seminar -> {
                    SeminarDto dto = new SeminarDto(seminar);
                    dto.setUserApplied(seminarApplicationRepository.existsByUserAndSeminar(currentUser, seminar));
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(seminarDtos);
    }

    @GetMapping("/search")
    @Operation(summary = "세미나 검색 및 필터링", description = "다양한 조건으로 세미나를 검색하고 필터링합니다")
    public ResponseEntity<List<SeminarDto>> searchSeminars(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Boolean isClosed,
            Authentication authentication) {
        
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        Category category = null;
        if (categoryId != null) {
            category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다"));
        }
        
        List<Seminar> seminars = seminarRepository.findWithFilters(
                category, keyword, startDate, endDate, isClosed);
        
        List<SeminarDto> seminarDtos = seminars.stream()
                .map(seminar -> {
                    SeminarDto dto = new SeminarDto(seminar);
                    dto.setUserApplied(seminarApplicationRepository.existsByUserAndSeminar(currentUser, seminar));
                    return dto;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(seminarDtos);
    }
    
    @GetMapping("/category/{categoryId}")
    @Operation(summary = "카테고리별 세미나 조회", description = "특정 카테고리의 세미나 목록을 조회합니다")
    public ResponseEntity<List<SeminarDto>> getSeminarsByCategory(
            @PathVariable UUID categoryId, Authentication authentication) {
        
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다"));
        
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        List<Seminar> seminars = seminarRepository.findByCategoryOrderByDateDesc(category);
        
        List<SeminarDto> seminarDtos = seminars.stream()
                .map(seminar -> {
                    SeminarDto dto = new SeminarDto(seminar);
                    dto.setUserApplied(seminarApplicationRepository.existsByUserAndSeminar(currentUser, seminar));
                    return dto;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(seminarDtos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "세미나 상세 조회", description = "특정 세미나의 상세 정보를 조회합니다")
    public ResponseEntity<SeminarDto> getSeminar(@PathVariable UUID id, Authentication authentication) {
        Seminar seminar = seminarRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("세미나를 찾을 수 없습니다"));
        
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        SeminarDto dto = new SeminarDto(seminar);
        dto.setUserApplied(seminarApplicationRepository.existsByUserAndSeminar(currentUser, seminar));
        
        // 첨부파일을 별도로 조회하여 설정
        List<FileAttachment> attachments = fileAttachmentRepository.findBySeminarOrderByUploadedAtDesc(seminar);
        List<FileAttachmentDto> attachmentDtos = attachments.stream()
                .map(FileAttachmentDto::new)
                .collect(Collectors.toList());
        dto.setAttachments(attachmentDtos);
        
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}/applicants")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "세미나 신청자 목록", description = "특정 세미나의 신청자 목록을 조회합니다 (관리자만)")
    public ResponseEntity<List<UserDto>> getSeminarApplicants(@PathVariable UUID id) {
        Seminar seminar = seminarRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("세미나를 찾을 수 없습니다"));

        List<SeminarApplication> applications = seminarApplicationRepository.findBySeminarOrderByAppliedAtDesc(seminar);
        List<UserDto> applicants = applications.stream()
                .map(application -> new UserDto(application.getUser()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(applicants);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "세미나 등록", description = "새로운 세미나를 등록합니다 (관리자만)")
    public ResponseEntity<SeminarDto> createSeminar(@Valid @RequestBody SeminarCreateRequest request, Authentication authentication) {
        User creator = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다"));
        }

        Seminar seminar = new Seminar(
                request.getTitle(),
                request.getDescription(),
                request.getDate(),
                request.getLocation(),
                creator,
                category
        );

        Seminar savedSeminar = seminarRepository.save(seminar);
        return ResponseEntity.ok(new SeminarDto(savedSeminar));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "세미나 수정", description = "기존 세미나를 수정합니다 (관리자만)")
    public ResponseEntity<SeminarDto> updateSeminar(@PathVariable UUID id, @Valid @RequestBody SeminarCreateRequest request, Authentication authentication) {
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        Seminar seminar = seminarRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("세미나를 찾을 수 없습니다"));

        // 세미나 생성자나 관리자만 수정 가능 (추가 검증)
        if (!seminar.getCreatedBy().getId().equals(currentUser.getId()) && !currentUser.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("세미나를 수정할 권한이 없습니다");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다"));
        }

        // 세미나 정보 업데이트
        seminar.setTitle(request.getTitle());
        seminar.setDescription(request.getDescription());
        seminar.setDate(request.getDate());
        seminar.setLocation(request.getLocation());
        seminar.setCategory(category);

        Seminar updatedSeminar = seminarRepository.save(seminar);
        return ResponseEntity.ok(new SeminarDto(updatedSeminar));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "세미나 삭제", description = "세미나를 삭제합니다 (관리자만)")
    public ResponseEntity<Void> deleteSeminar(@PathVariable UUID id, Authentication authentication) {
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        Seminar seminar = seminarRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("세미나를 찾을 수 없습니다"));

        // 세미나 생성자나 관리자만 삭제 가능 (추가 검증)
        if (!seminar.getCreatedBy().getId().equals(currentUser.getId()) && !currentUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        seminarRepository.delete(seminar);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "세미나 마감 처리", description = "세미나를 강제로 마감 처리합니다 (관리자만)")
    public ResponseEntity<SeminarDto> closeSeminar(@PathVariable UUID id, Authentication authentication) {
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        Seminar seminar = seminarRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("세미나를 찾을 수 없습니다"));

        // 이미 마감된 세미나인지 확인
        if (seminar.getIsClosed()) {
            throw new RuntimeException("이미 마감된 세미나입니다");
        }

        // 날짜가 지난 세미나는 마감 처리할 수 없음
        if (seminar.getDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("이미 종료된 세미나는 마감 처리할 수 없습니다");
        }

        seminar.setIsClosed(true);
        Seminar savedSeminar = seminarRepository.save(seminar);
        
        SeminarDto dto = new SeminarDto(savedSeminar);
        dto.setUserApplied(seminarApplicationRepository.existsByUserAndSeminar(currentUser, savedSeminar));
        
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}/reopen")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "세미나 마감 취소", description = "마감된 세미나를 다시 열어줍니다 (관리자만)")
    public ResponseEntity<SeminarDto> reopenSeminar(@PathVariable UUID id, Authentication authentication) {
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        Seminar seminar = seminarRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("세미나를 찾을 수 없습니다"));

        // 마감되지 않은 세미나인지 확인
        if (!seminar.getIsClosed()) {
            throw new RuntimeException("마감되지 않은 세미나입니다");
        }

        // 날짜가 지난 세미나는 다시 열 수 없음
        if (seminar.getDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("이미 종료된 세미나는 다시 열 수 없습니다");
        }

        seminar.setIsClosed(false);
        Seminar savedSeminar = seminarRepository.save(seminar);
        
        SeminarDto dto = new SeminarDto(savedSeminar);
        dto.setUserApplied(seminarApplicationRepository.existsByUserAndSeminar(currentUser, savedSeminar));
        
        return ResponseEntity.ok(dto);
    }
} 