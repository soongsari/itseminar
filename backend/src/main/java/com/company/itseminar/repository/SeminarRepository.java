package com.company.itseminar.repository;

import com.company.itseminar.entity.Seminar;
import com.company.itseminar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SeminarRepository extends JpaRepository<Seminar, UUID> {
    
    List<Seminar> findByOrderByDateDesc();
    
    List<Seminar> findByCreatedByOrderByDateDesc(User createdBy);
    
    @Query("SELECT s FROM Seminar s WHERE s.date < :now AND s.isClosed = false")
    List<Seminar> findExpiredSeminars(LocalDateTime now);
} 