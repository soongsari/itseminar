package com.company.itseminar.controller;

import com.company.itseminar.dto.CategoryDto;
import com.company.itseminar.entity.Category;
import com.company.itseminar.repository.CategoryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Categories", description = "카테고리 관련 API")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    @Operation(summary = "카테고리 목록 조회", description = "활성화된 카테고리 목록을 조회합니다")
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        List<Category> categories = categoryRepository.findByIsActiveTrueOrderByDisplayOrderAscNameAsc();
        List<CategoryDto> categoryDtos = categories.stream()
                .map(CategoryDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categoryDtos);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "모든 카테고리 조회", description = "관리자용: 비활성화된 카테고리 포함 모든 카테고리를 조회합니다")
    public ResponseEntity<List<CategoryDto>> getAllCategoriesForAdmin() {
        List<Category> categories = categoryRepository.findByOrderByDisplayOrderAscNameAsc();
        List<CategoryDto> categoryDtos = categories.stream()
                .map(CategoryDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categoryDtos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "카테고리 상세 조회", description = "특정 카테고리의 상세 정보를 조회합니다")
    public ResponseEntity<CategoryDto> getCategory(@PathVariable UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다"));
        return ResponseEntity.ok(new CategoryDto(category));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "카테고리 생성", description = "새로운 카테고리를 생성합니다 (관리자만)")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        // 이름 중복 체크
        if (categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("이미 존재하는 카테고리 이름입니다");
        }

        Category category = new Category(
                request.getName(),
                request.getDescription(),
                request.getIconName(),
                request.getColorCode()
        );
        category.setDisplayOrder(request.getDisplayOrder());

        Category savedCategory = categoryRepository.save(category);
        return ResponseEntity.ok(new CategoryDto(savedCategory));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "카테고리 수정", description = "기존 카테고리를 수정합니다 (관리자만)")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryCreateRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다"));

        // 다른 카테고리와 이름 중복 체크
        if (!category.getName().equals(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("이미 존재하는 카테고리 이름입니다");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setIconName(request.getIconName());
        category.setColorCode(request.getColorCode());
        category.setDisplayOrder(request.getDisplayOrder());
        category.setIsActive(request.getIsActive());

        Category updatedCategory = categoryRepository.save(category);
        return ResponseEntity.ok(new CategoryDto(updatedCategory));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "카테고리 삭제", description = "카테고리를 비활성화합니다 (관리자만)")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다"));

        // 실제 삭제가 아닌 비활성화
        category.setIsActive(false);
        categoryRepository.save(category);

        return ResponseEntity.ok().build();
    }

    // 카테고리 생성/수정 요청 DTO
    public static class CategoryCreateRequest {
        private String name;
        private String description;
        private String iconName;
        private String colorCode;
        private Integer displayOrder = 0;
        private Boolean isActive = true;

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getIconName() { return iconName; }
        public void setIconName(String iconName) { this.iconName = iconName; }
        public String getColorCode() { return colorCode; }
        public void setColorCode(String colorCode) { this.colorCode = colorCode; }
        public Integer getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    }
} 