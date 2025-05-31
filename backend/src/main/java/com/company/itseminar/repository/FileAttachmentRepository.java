package com.company.itseminar.repository;

import com.company.itseminar.entity.FileAttachment;
import com.company.itseminar.entity.Seminar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FileAttachmentRepository extends JpaRepository<FileAttachment, UUID> {
    
    List<FileAttachment> findBySeminarOrderByUploadedAtDesc(Seminar seminar);
} 