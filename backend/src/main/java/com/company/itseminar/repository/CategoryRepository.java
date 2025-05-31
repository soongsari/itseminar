package com.company.itseminar.repository;

import com.company.itseminar.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    
    List<Category> findByIsActiveTrueOrderByDisplayOrderAscNameAsc();
    
    Optional<Category> findByNameAndIsActiveTrue(String name);
    
    boolean existsByName(String name);
    
    List<Category> findByOrderByDisplayOrderAscNameAsc();
} 