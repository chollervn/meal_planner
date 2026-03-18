package com.ronaldo.meal_planner_vip.controller;

import com.ronaldo.meal_planner_vip.dto.ApiResponse;
import com.ronaldo.meal_planner_vip.dto.ScheduleMealRequest;
import com.ronaldo.meal_planner_vip.entity.ScheduleMeal;
import com.ronaldo.meal_planner_vip.service.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/schedules")
public class ScheduleController {
    @Autowired
    private ScheduleService scheduleService;

    // Áp dụng meal vào lịch
    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<ScheduleMeal>> applyMeal(@Valid @RequestBody ScheduleMealRequest request) {
        ScheduleMeal scheduleMeal = scheduleService.applyMealToSchedule(request);
        return ResponseEntity.ok(ApiResponse.success("Áp dụng meal thành công!", scheduleMeal));
    }

    // Gỡ meal khỏi lịch
    @DeleteMapping("/remove")
    public ResponseEntity<ApiResponse<String>> removeMeal(
            @RequestParam Integer userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        scheduleService.removeMealFromSchedule(userId, date);
        return ResponseEntity.ok(ApiResponse.success("Gỡ meal thành công!", null));
    }

    // Lấy tất cả meals trong schedule của user
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ScheduleMeal>>> getScheduleMeals(@PathVariable Integer userId) {
        List<ScheduleMeal> meals = scheduleService.getScheduleMeals(userId);
        return ResponseEntity.ok(ApiResponse.success(meals));
    }

    // Lấy meals trong tuần
    @GetMapping("/user/{userId}/week")
    public ResponseEntity<ApiResponse<List<ScheduleMeal>>> getWeeklySchedule(
            @PathVariable Integer userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<ScheduleMeal> meals = scheduleService.getScheduleMealsByDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(meals));
    }

    // Lấy meal của một ngày cụ thể
    @GetMapping("/user/{userId}/date")
    public ResponseEntity<ApiResponse<ScheduleMeal>> getMealByDate(
            @PathVariable Integer userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        ScheduleMeal meal = scheduleService.getMealByDate(userId, date);
        return ResponseEntity.ok(ApiResponse.success(meal));
    }

    // Thống kê: Thực đơn được sử dụng nhiều nhất
    @GetMapping("/stats/most-used")
    public ResponseEntity<ApiResponse<List<Object[]>>> getMostUsedMeals() {
        List<Object[]> stats = scheduleService.getMostUsedMeals();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
