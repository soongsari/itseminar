package com.company.itseminar.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "attendances")
public class Attendance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seminar_id", nullable = false)
    private Seminar seminar;
    
    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;
    
    @Column(name = "check_in_method")
    @Enumerated(EnumType.STRING)
    private CheckInMethod checkInMethod;
    
    @Column(name = "qr_code_data")
    private String qrCodeData; // QR 코드로 체크인한 경우의 데이터
    
    @Column(name = "notes")
    private String notes; // 관리자 메모
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    // 체크인 방법 열거형
    public enum CheckInMethod {
        QR_CODE,     // QR 코드 스캔
        MANUAL,      // 관리자 수동 체크인
        NFC,         // NFC 태그 (미래 확장용)
        BLUETOOTH    // 블루투스 비콘 (미래 확장용)
    }
    
    // Constructors
    public Attendance() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Attendance(User user, Seminar seminar, CheckInMethod checkInMethod) {
        this();
        this.user = user;
        this.seminar = seminar;
        this.checkInMethod = checkInMethod;
        this.checkedInAt = LocalDateTime.now();
    }
    
    public Attendance(User user, Seminar seminar, CheckInMethod checkInMethod, String qrCodeData) {
        this(user, seminar, checkInMethod);
        this.qrCodeData = qrCodeData;
    }
    
    // 세미나 시작 후 체크인인지 확인
    public boolean isLateCheckIn() {
        if (checkedInAt == null || seminar == null) {
            return false;
        }
        return checkedInAt.isAfter(seminar.getDate());
    }
    
    // 체크인까지 걸린 시간 (분)
    public long getCheckInDelayMinutes() {
        if (checkedInAt == null || seminar == null) {
            return 0;
        }
        
        if (checkedInAt.isBefore(seminar.getDate())) {
            return 0; // 세미나 시작 전 체크인
        }
        
        return java.time.Duration.between(seminar.getDate(), checkedInAt).toMinutes();
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
    
    public LocalDateTime getCheckedInAt() {
        return checkedInAt;
    }
    
    public void setCheckedInAt(LocalDateTime checkedInAt) {
        this.checkedInAt = checkedInAt;
    }
    
    public CheckInMethod getCheckInMethod() {
        return checkInMethod;
    }
    
    public void setCheckInMethod(CheckInMethod checkInMethod) {
        this.checkInMethod = checkInMethod;
    }
    
    public String getQrCodeData() {
        return qrCodeData;
    }
    
    public void setQrCodeData(String qrCodeData) {
        this.qrCodeData = qrCodeData;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 