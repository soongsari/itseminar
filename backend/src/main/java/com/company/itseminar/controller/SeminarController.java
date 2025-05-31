package com.company.itseminar.controller;

import com.company.itseminar.dto.SeminarCreateRequest;
import com.company.itseminar.dto.SeminarDto;
import com.company.itseminar.dto.UserDto;
import com.company.itseminar.entity.Seminar;
import com.company.itseminar.entity.SeminarApplication;
import com.company.itseminar.entity.User;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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

        Seminar seminar = new Seminar(
                request.getTitle(),
                request.getDescription(),
                request.getDate(),
                request.getLocation(),
                creator
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

        // 세미나 정보 업데이트
        seminar.setTitle(request.getTitle());
        seminar.setDescription(request.getDescription());
        seminar.setDate(request.getDate());
        seminar.setLocation(request.getLocation());

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
            throw new RuntimeException("세미나를 삭제할 권한이 없습니다");
        }

        seminarRepository.delete(seminar);
        return ResponseEntity.ok().build();
    }
} 