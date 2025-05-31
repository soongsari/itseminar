package com.company.itseminar.dto;

import com.company.itseminar.entity.Seminar;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.ArrayList;

public class SeminarDto {
    
    private UUID id;
    private String title;
    private String description;
    private LocalDateTime date;
    private String location;
    private Boolean isClosed;
    private UserDto createdBy;
    private LocalDateTime createdAt;
    private List<FileAttachmentDto> attachments;
    private int applicationCount;
    
    @JsonProperty("isUserApplied")
    private boolean isUserApplied;
    
    @JsonProperty("canCancel")
    private boolean canCancel;
    
    // Constructors
    public SeminarDto() {}
    
    public SeminarDto(Seminar seminar) {
        this.id = seminar.getId();
        this.title = seminar.getTitle();
        this.description = seminar.getDescription();
        this.date = seminar.getDate();
        this.location = seminar.getLocation();
        this.isClosed = seminar.getIsClosed() || seminar.isExpired();
        this.createdBy = new UserDto(seminar.getCreatedBy());
        this.createdAt = seminar.getCreatedAt();
        
        // 첨부파일을 안전하게 로드
        try {
            if (seminar.getAttachments() != null && !seminar.getAttachments().isEmpty()) {
                this.attachments = seminar.getAttachments().stream()
                        .map(FileAttachmentDto::new)
                        .collect(Collectors.toList());
            } else {
                this.attachments = new ArrayList<>();
            }
        } catch (Exception e) {
            // 첨부파일 로드 실패 시 빈 리스트로 설정
            this.attachments = new ArrayList<>();
        }
        
        if (seminar.getApplications() != null) {
            this.applicationCount = seminar.getApplications().size();
        } else {
            this.applicationCount = 0;
        }
        
        this.canCancel = seminar.isCancellationAllowed() && !this.isClosed;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDateTime getDate() {
        return date;
    }
    
    public void setDate(LocalDateTime date) {
        this.date = date;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public Boolean getIsClosed() {
        return isClosed;
    }
    
    public void setIsClosed(Boolean isClosed) {
        this.isClosed = isClosed;
    }
    
    public UserDto getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(UserDto createdBy) {
        this.createdBy = createdBy;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<FileAttachmentDto> getAttachments() {
        return attachments;
    }
    
    public void setAttachments(List<FileAttachmentDto> attachments) {
        this.attachments = attachments;
    }
    
    public int getApplicationCount() {
        return applicationCount;
    }
    
    public void setApplicationCount(int applicationCount) {
        this.applicationCount = applicationCount;
    }
    
    public boolean isUserApplied() {
        return isUserApplied;
    }
    
    public void setUserApplied(boolean userApplied) {
        isUserApplied = userApplied;
    }
    
    public boolean isCanCancel() {
        return canCancel;
    }
    
    public void setCanCancel(boolean canCancel) {
        this.canCancel = canCancel;
    }
} 