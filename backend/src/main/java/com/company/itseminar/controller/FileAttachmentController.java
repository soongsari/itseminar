package com.company.itseminar.controller;

import com.company.itseminar.dto.FileAttachmentDto;
import com.company.itseminar.entity.FileAttachment;
import com.company.itseminar.entity.Seminar;
import com.company.itseminar.entity.User;
import com.company.itseminar.repository.FileAttachmentRepository;
import com.company.itseminar.repository.SeminarRepository;
import com.company.itseminar.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@Tag(name = "FileAttachment", description = "파일 첨부 관련 API")
public class FileAttachmentController {

    @Autowired
    private FileAttachmentRepository fileAttachmentRepository;

    @Autowired
    private SeminarRepository seminarRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/seminars/{seminarId}/attachments")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "파일 업로드", description = "세미나에 파일을 업로드합니다 (관리자만)")
    public ResponseEntity<List<FileAttachmentDto>> uploadFiles(
            @PathVariable UUID seminarId,
            @RequestParam("files") MultipartFile[] files,
            Authentication authentication) {

        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        Seminar seminar = seminarRepository.findById(seminarId)
                .orElseThrow(() -> new RuntimeException("세미나를 찾을 수 없습니다"));

        // 세미나 생성자나 관리자만 파일 업로드 가능 (추가 검증)
        if (!seminar.getCreatedBy().getId().equals(currentUser.getId()) && !currentUser.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("파일을 업로드할 권한이 없습니다");
        }

        try {
            List<FileAttachment> attachments = List.of(files).stream()
                    .map(file -> {
                        try {
                            return new FileAttachment(
                                    seminar,
                                    file.getOriginalFilename(),
                                    file.getContentType(),
                                    file.getSize(),
                                    file.getBytes()
                            );
                        } catch (IOException e) {
                            throw new RuntimeException("파일 처리 중 오류가 발생했습니다: " + e.getMessage());
                        }
                    })
                    .collect(Collectors.toList());

            List<FileAttachment> savedAttachments = fileAttachmentRepository.saveAll(attachments);

            List<FileAttachmentDto> attachmentDtos = savedAttachments.stream()
                    .map(FileAttachmentDto::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(attachmentDtos);

        } catch (Exception e) {
            throw new RuntimeException("파일 업로드 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @GetMapping("/attachments/{id}/download")
    @Operation(summary = "파일 다운로드", description = "첨부파일을 다운로드합니다")
    public ResponseEntity<ByteArrayResource> downloadFile(@PathVariable UUID id) {
        FileAttachment attachment = fileAttachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("파일을 찾을 수 없습니다"));

        ByteArrayResource resource = new ByteArrayResource(attachment.getFileData());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(attachment.getContentType() != null ? attachment.getContentType() : "application/octet-stream"))
                .contentLength(attachment.getFileSize())
                .body(resource);
    }

    @GetMapping("/seminars/{seminarId}/attachments")
    @Operation(summary = "세미나 첨부파일 목록", description = "특정 세미나의 첨부파일 목록을 조회합니다")
    public ResponseEntity<List<FileAttachmentDto>> getSeminarAttachments(@PathVariable UUID seminarId) {
        Seminar seminar = seminarRepository.findById(seminarId)
                .orElseThrow(() -> new RuntimeException("세미나를 찾을 수 없습니다"));

        List<FileAttachment> attachments = fileAttachmentRepository.findBySeminarOrderByUploadedAtDesc(seminar);
        List<FileAttachmentDto> attachmentDtos = attachments.stream()
                .map(FileAttachmentDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(attachmentDtos);
    }

    @DeleteMapping("/attachments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "파일 삭제", description = "첨부파일을 삭제합니다 (관리자만)")
    public ResponseEntity<Map<String, Object>> deleteFile(@PathVariable UUID id, Authentication authentication) {
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        FileAttachment attachment = fileAttachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("파일을 찾을 수 없습니다"));

        Seminar seminar = attachment.getSeminar();

        // 세미나 생성자나 관리자만 파일 삭제 가능 (추가 검증)
        if (!seminar.getCreatedBy().getId().equals(currentUser.getId()) && !currentUser.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("파일을 삭제할 권한이 없습니다");
        }

        fileAttachmentRepository.delete(attachment);

        return ResponseEntity.ok(Map.of("success", true, "message", "파일이 삭제되었습니다"));
    }
} 