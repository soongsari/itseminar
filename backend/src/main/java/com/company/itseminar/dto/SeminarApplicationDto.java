package com.company.itseminar.dto;

import com.company.itseminar.entity.SeminarApplication;
import java.time.LocalDateTime;
import java.util.UUID;

public class SeminarApplicationDto {
    
    private UUID id;
    private UserDto user;
    private SeminarDto seminar;
    private LocalDateTime appliedAt;
    private boolean canCancel;
    
    // Constructors
    public SeminarApplicationDto() {}
    
    public SeminarApplicationDto(SeminarApplication application) {
        this.id = application.getId();
        this.user = new UserDto(application.getUser());
        this.seminar = new SeminarDto(application.getSeminar());
        this.appliedAt = application.getAppliedAt();
        this.canCancel = application.getSeminar().isCancellationAllowed() && 
                        !application.getSeminar().getIsClosed() && 
                        !application.getSeminar().isExpired();
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public UserDto getUser() {
        return user;
    }
    
    public void setUser(UserDto user) {
        this.user = user;
    }
    
    public SeminarDto getSeminar() {
        return seminar;
    }
    
    public void setSeminar(SeminarDto seminar) {
        this.seminar = seminar;
    }
    
    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }
    
    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }
    
    public boolean isCanCancel() {
        return canCancel;
    }
    
    public void setCanCancel(boolean canCancel) {
        this.canCancel = canCancel;
    }
} 