package com.company.itseminar.repository;

import com.company.itseminar.entity.Category;
import com.company.itseminar.entity.Seminar;
import com.company.itseminar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    // 카테고리별 검색
    List<Seminar> findByCategoryOrderByDateDesc(Category category);
    
    // 제목 또는 설명으로 검색
    @Query("SELECT s FROM Seminar s WHERE " +
           "LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY s.date DESC")
    List<Seminar> findByTitleOrDescriptionContainingIgnoreCase(@Param("keyword") String keyword);
    
    // 카테고리와 키워드로 검색
    @Query("SELECT s FROM Seminar s WHERE " +
           "s.category = :category AND " +
           "(LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY s.date DESC")
    List<Seminar> findByCategoryAndKeyword(@Param("category") Category category, @Param("keyword") String keyword);
    
    // 날짜 범위로 검색
    @Query("SELECT s FROM Seminar s WHERE s.date BETWEEN :startDate AND :endDate ORDER BY s.date DESC")
    List<Seminar> findByDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // 마감 상태로 검색
    List<Seminar> findByIsClosedOrderByDateDesc(Boolean isClosed);
    
    // 복합 검색 (모든 조건)
    @Query("SELECT s FROM Seminar s WHERE " +
           "(:category IS NULL OR s.category = :category) AND " +
           "(:keyword IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:startDate IS NULL OR s.date >= :startDate) AND " +
           "(:endDate IS NULL OR s.date <= :endDate) AND " +
           "(:isClosed IS NULL OR s.isClosed = :isClosed) " +
           "ORDER BY s.date DESC")
    List<Seminar> findWithFilters(
            @Param("category") Category category,
            @Param("keyword") String keyword,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("isClosed") Boolean isClosed
    );
    
    // 카테고리별 세미나 수 집계
    @Query("SELECT COUNT(s) FROM Seminar s WHERE s.category = :category")
    Long countByCategory(@Param("category") Category category);
    
    // 월별 세미나 통계
    @Query("SELECT YEAR(s.date) as year, MONTH(s.date) as month, COUNT(s) as count " +
           "FROM Seminar s " +
           "GROUP BY YEAR(s.date), MONTH(s.date) " +
           "ORDER BY YEAR(s.date) DESC, MONTH(s.date) DESC")
    List<Object[]> findMonthlySeminarStats();
} 