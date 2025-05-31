package com.company.itseminar.controller;

import com.company.itseminar.dto.SeminarCreateRequest;
import com.company.itseminar.dto.SeminarDto;
import com.company.itseminar.entity.Seminar;
import com.company.itseminar.entity.User;
import com.company.itseminar.repository.SeminarRepository;
import com.company.itseminar.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seminars")
public class SeminarController {

    @Autowired
    private SeminarRepository seminarRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<SeminarDto>> getAllSeminars() {
        List<Seminar> seminars = seminarRepository.findByOrderByDateDesc();
        List<SeminarDto> seminarDtos = seminars.stream()
                .map(SeminarDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(seminarDtos);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SeminarDto> createSeminar(@Valid @RequestBody SeminarCreateRequest request, Authentication authentication) {
        User creator = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        Seminar seminar = new Seminar(
                request.getTitle(),
                request.getDescription(),
                request.getDate(),
                request.getLocation(),
                creator
        );

        Seminar savedSeminar = seminarRepository.save(seminar);
        return ResponseEntity.ok(new SeminarDto(savedSeminar));
    }
} 