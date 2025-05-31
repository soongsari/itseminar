package com.company.itseminar.repository;

import com.company.itseminar.entity.Seminar;
import com.company.itseminar.entity.SeminarApplication;
import com.company.itseminar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SeminarApplicationRepository extends JpaRepository<SeminarApplication, UUID> {
    
    List<SeminarApplication> findByUserOrderByAppliedAtDesc(User user);
    
    List<SeminarApplication> findBySeminarOrderByAppliedAtDesc(Seminar seminar);
    
    Optional<SeminarApplication> findByUserAndSeminar(User user, Seminar seminar);
    
    boolean existsByUserAndSeminar(User user, Seminar seminar);
    
    long countBySeminar(Seminar seminar);
    
    List<SeminarApplication> findByAppliedAtAfter(LocalDateTime date);
    
    List<SeminarApplication> findTop10ByOrderByAppliedAtDesc();
} 