package com.company.itseminar.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "seminar_applications", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "seminar_id"}))
public class SeminarApplication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seminar_id", nullable = false)
    private Seminar seminar;
    
    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt;
    
    // Constructors
    public SeminarApplication() {
        this.appliedAt = LocalDateTime.now();
    }
    
    public SeminarApplication(User user, Seminar seminar) {
        this();
        this.user = user;
        this.seminar = seminar;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Seminar getSeminar() {
        return seminar;
    }
    
    public void setSeminar(Seminar seminar) {
        this.seminar = seminar;
    }
    
    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }
    
    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }
} 