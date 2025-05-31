package com.company.itseminar.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "seminars")
public class Seminar {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "seminar_date", nullable = false)
    private LocalDateTime date;
    
    @Column(nullable = false)
    private String location;
    
    @Column(name = "is_closed", nullable = false)
    private Boolean isClosed = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "seminar", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SeminarApplication> applications;
    
    @OneToMany(mappedBy = "seminar", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FileAttachment> attachments;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    
    // Constructors
    public Seminar() {
        this.createdAt = LocalDateTime.now();
        this.isClosed = false;
    }
    
    public Seminar(String title, String description, LocalDateTime date, String location, User createdBy) {
        this();
        this.title = title;
        this.description = description;
        this.date = date;
        this.location = location;
        this.createdBy = createdBy;
    }
    
    public Seminar(String title, String description, LocalDateTime date, String location, User createdBy, Category category) {
        this();
        this.title = title;
        this.description = description;
        this.date = date;
        this.location = location;
        this.createdBy = createdBy;
        this.category = category;
    }
    
    // 세미나 시작 시간이 지났는지 확인하는 메서드
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.date);
    }
    
    // 신청 취소 가능한지 확인하는 메서드 (24시간 전까지만)
    public boolean isCancellationAllowed() {
        return LocalDateTime.now().isBefore(this.date.minusHours(24));
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
    
    public User getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<SeminarApplication> getApplications() {
        return applications;
    }
    
    public void setApplications(List<SeminarApplication> applications) {
        this.applications = applications;
    }
    
    public List<FileAttachment> getAttachments() {
        return attachments;
    }
    
    public void setAttachments(List<FileAttachment> attachments) {
        this.attachments = attachments;
    }
    
    public Category getCategory() {
        return category;
    }
    
    public void setCategory(Category category) {
        this.category = category;
    }
} 