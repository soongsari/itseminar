package com.company.itseminar.dto;

import com.company.itseminar.entity.FileAttachment;
import java.time.LocalDateTime;
import java.util.UUID;

public class FileAttachmentDto {
    
    private UUID id;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private LocalDateTime uploadedAt;
    
    // Constructors
    public FileAttachmentDto() {}
    
    public FileAttachmentDto(FileAttachment fileAttachment) {
        this.id = fileAttachment.getId();
        this.fileName = fileAttachment.getFileName();
        this.contentType = fileAttachment.getContentType();
        this.fileSize = fileAttachment.getFileSize();
        this.uploadedAt = fileAttachment.getUploadedAt();
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public String getContentType() {
        return contentType;
    }
    
    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
    
    public Long getFileSize() {
        return fileSize;
    }
    
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
    
    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
    
    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
} 