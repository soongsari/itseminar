package com.company.itseminar.dto;

import com.company.itseminar.entity.Category;
import java.time.LocalDateTime;
import java.util.UUID;

public class CategoryDto {
    
    private UUID id;
    private String name;
    private String description;
    private String iconName;
    private String colorCode;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Long seminarCount; // 이 카테고리의 세미나 수
    
    // Constructors
    public CategoryDto() {}
    
    public CategoryDto(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.description = category.getDescription();
        this.iconName = category.getIconName();
        this.colorCode = category.getColorCode();
        this.displayOrder = category.getDisplayOrder();
        this.isActive = category.getIsActive();
        this.createdAt = category.getCreatedAt();
        
        // 세미나 수 계산 (null 체크)
        if (category.getSeminars() != null) {
            this.seminarCount = (long) category.getSeminars().size();
        } else {
            this.seminarCount = 0L;
        }
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getIconName() {
        return iconName;
    }
    
    public void setIconName(String iconName) {
        this.iconName = iconName;
    }
    
    public String getColorCode() {
        return colorCode;
    }
    
    public void setColorCode(String colorCode) {
        this.colorCode = colorCode;
    }
    
    public Integer getDisplayOrder() {
        return displayOrder;
    }
    
    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public Long getSeminarCount() {
        return seminarCount;
    }
    
    public void setSeminarCount(Long seminarCount) {
        this.seminarCount = seminarCount;
    }
} 