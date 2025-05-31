package com.company.itseminar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

public class SeminarCreateRequest {
    
    @NotBlank(message = "제목은 필수입니다")
    private String title;
    
    private String description;
    
    @NotNull(message = "날짜는 필수입니다")
    private LocalDateTime date;
    
    @NotBlank(message = "장소는 필수입니다")
    private String location;
    
    private UUID categoryId; // 선택적 카테고리 ID
    
    // Constructors
    public SeminarCreateRequest() {}
    
    public SeminarCreateRequest(String title, String description, LocalDateTime date, String location) {
        this.title = title;
        this.description = description;
        this.date = date;
        this.location = location;
    }
    
    public SeminarCreateRequest(String title, String description, LocalDateTime date, String location, UUID categoryId) {
        this.title = title;
        this.description = description;
        this.date = date;
        this.location = location;
        this.categoryId = categoryId;
    }
    
    // Getters and Setters
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
    
    public UUID getCategoryId() {
        return categoryId;
    }
    
    public void setCategoryId(UUID categoryId) {
        this.categoryId = categoryId;
    }
} 