package com.ronaldo.meal_planner_vip.controller;

import com.ronaldo.meal_planner_vip.dto.ApiResponse;
import com.ronaldo.meal_planner_vip.dto.MealTemplateRequest;
import com.ronaldo.meal_planner_vip.dto.NutritionResponse;
import com.ronaldo.meal_planner_vip.entity.MealDetail;
import com.ronaldo.meal_planner_vip.entity.MealTemplate;
import com.ronaldo.meal_planner_vip.service.MealTemplateService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/meals")
public class MealController {
    @Autowired
    private MealTemplateService mealTemplateService;

    // Tạo meal template mới
    @PostMapping
    public ResponseEntity<ApiResponse<MealTemplate>> createMeal(@Valid @RequestBody MealTemplateRequest request) {
        MealTemplate meal = mealTemplateService.createMealTemplate(request);
        return ResponseEntity.ok(ApiResponse.success("Tạo meal thành công!", meal));
    }

    // Lấy tất cả meal templates
    @GetMapping
    public ResponseEntity<ApiResponse<List<MealTemplate>>> getAllMeals() {
        List<MealTemplate> meals = mealTemplateService.getAllMealTemplates();
        return ResponseEntity.ok(ApiResponse.success(meals));
    }

    // Lấy meal theo ID
    @GetMapping("/{mealId}")
    public ResponseEntity<ApiResponse<MealTemplate>> getMealById(@PathVariable Integer mealId) {
        MealTemplate meal = mealTemplateService.getMealTemplateById(mealId);
        return ResponseEntity.ok(ApiResponse.success(meal));
    }

    // Lấy chi tiết meal (bao gồm danh sách food)
    @GetMapping("/{mealId}/details")
    public ResponseEntity<ApiResponse<List<MealDetail>>> getMealDetails(@PathVariable Integer mealId) {
        List<MealDetail> details = mealTemplateService.getMealDetails(mealId);
        return ResponseEntity.ok(ApiResponse.success(details));
    }

    // Lấy meals phù hợp với BMI của user
    @GetMapping("/user/{userId}/recommended")
    public ResponseEntity<ApiResponse<List<MealTemplate>>> getMealsByUserBmi(@PathVariable Integer userId) {
        List<MealTemplate> meals = mealTemplateService.getMealsByUserBmi(userId);
        return ResponseEntity.ok(ApiResponse.success(meals));
    }

    // Lấy meals theo BMI range
    @GetMapping("/bmi/{bmi}")
    public ResponseEntity<ApiResponse<List<MealTemplate>>> getMealsByBmi(@PathVariable Float bmi) {
        List<MealTemplate> meals = mealTemplateService.getMealsByBmiRange(bmi);
        return ResponseEntity.ok(ApiResponse.success(meals));
    }

    // Lấy meals theo type (weight_loss, weight_gain, maintain)
    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<MealTemplate>>> getMealsByType(@PathVariable String type) {
        List<MealTemplate> meals = mealTemplateService.getMealsByType(type);
        return ResponseEntity.ok(ApiResponse.success(meals));
    }

    // Tìm kiếm meals theo tên
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<MealTemplate>>> searchMeals(@RequestParam String name) {
        List<MealTemplate> meals = mealTemplateService.searchMealByName(name);
        return ResponseEntity.ok(ApiResponse.success(meals));
    }

    // Cập nhật meal
    @PutMapping("/{mealId}")
    public ResponseEntity<ApiResponse<MealTemplate>> updateMeal(
            @PathVariable Integer mealId,
            @RequestBody MealTemplateRequest request) {
        MealTemplate meal = mealTemplateService.updateMealTemplate(mealId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật meal thành công!", meal));
    }

    // Xóa meal
    @DeleteMapping("/{mealId}")
    public ResponseEntity<ApiResponse<String>> deleteMeal(@PathVariable Integer mealId) {
        mealTemplateService.deleteMealTemplate(mealId);
        return ResponseEntity.ok(ApiResponse.success("Xóa meal thành công!", null));
    }

    // Tính tổng dinh dưỡng của meal
    @GetMapping("/{mealId}/nutrition")
    public ResponseEntity<ApiResponse<NutritionResponse>> getMealNutrition(@PathVariable Integer mealId) {
        NutritionResponse nutrition = mealTemplateService.calculateMealNutrition(mealId);
        return ResponseEntity.ok(ApiResponse.success(nutrition));
    }

    // Kiểm tra meal tồn tại
    @GetMapping("/{mealId}/exists")
    public ResponseEntity<ApiResponse<Boolean>> checkMealExists(@PathVariable Integer mealId) {
        boolean exists = mealTemplateService.checkMealExists(mealId);
        return ResponseEntity.ok(ApiResponse.success(exists));
    }
}
