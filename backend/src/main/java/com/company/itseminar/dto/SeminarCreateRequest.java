package com.company.itseminar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class SeminarCreateRequest {
    
    @NotBlank(message = "제목은 필수입니다")
    private String title;
    
    private String description;
    
    @NotNull(message = "날짜는 필수입니다")
    private LocalDateTime date;
    
    @NotBlank(message = "장소는 필수입니다")
    private String location;
    
    // Constructors
    public SeminarCreateRequest() {}
    
    public SeminarCreateRequest(String title, String description, LocalDateTime date, String location) {
        this.title = title;
        this.description = description;
        this.date = date;
        this.location = location;
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
} 