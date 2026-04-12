package com.ronaldo.meal_planner_vip.controller;

import com.ronaldo.meal_planner_vip.dto.ApiResponse;
import com.ronaldo.meal_planner_vip.dto.FoodAdditionRequestResponse;
import com.ronaldo.meal_planner_vip.dto.FoodRequest;
import com.ronaldo.meal_planner_vip.dto.NutritionResponse;
import com.ronaldo.meal_planner_vip.entity.Foods;
import com.ronaldo.meal_planner_vip.exception.UnauthorizedException;
import com.ronaldo.meal_planner_vip.service.FoodAdditionRequestService;
import com.ronaldo.meal_planner_vip.service.FoodService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/foods")
public class FoodsController {
    @Autowired
    private FoodService foodService;

    @Autowired
    private FoodAdditionRequestService foodAdditionRequestService;

    // Tạo food mới
    @PostMapping
    public ResponseEntity<ApiResponse<Foods>> createFood(@Valid @RequestBody FoodRequest request) {
        Foods food = foodService.createFood(request);
        return ResponseEntity.ok(ApiResponse.success("Tạo food thành công!", food));
    }

    // Lấy tất cả foods
    @GetMapping
    public ResponseEntity<ApiResponse<List<Foods>>> getAllFoods() {
        List<Foods> foods = foodService.getAllFoods();
        return ResponseEntity.ok(ApiResponse.success(foods));
    }

    // Lấy food theo ID
    @GetMapping("/{foodId}")
    public ResponseEntity<ApiResponse<Foods>> getFoodById(@PathVariable Integer foodId) {
        Foods food = foodService.getFoodById(foodId);
        return ResponseEntity.ok(ApiResponse.success(food));
    }

    // Tìm kiếm food theo tên
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Foods>>> searchFood(@RequestParam String name) {
        List<Foods> foods = foodService.searchFoodByName(name);
        return ResponseEntity.ok(ApiResponse.success(foods));
    }

    // Cập nhật food
    @PutMapping("/{foodId}")
    public ResponseEntity<ApiResponse<Foods>> updateFood(
            @PathVariable Integer foodId,
            @RequestBody FoodRequest request) {
        Foods food = foodService.updateFood(foodId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật food thành công!", food));
    }

    // Xóa food
    @DeleteMapping("/{foodId}")
    public ResponseEntity<ApiResponse<String>> deleteFood(@PathVariable Integer foodId) {
        foodService.deleteFood(foodId);
        return ResponseEntity.ok(ApiResponse.success("Xóa food thành công!", null));
    }

    // User gửi yêu cầu thêm food để admin duyệt
    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<FoodAdditionRequestResponse>> createFoodRequest(@Valid @RequestBody FoodRequest request) {
        Integer userId = getCurrentUserId();
        FoodAdditionRequestResponse created = foodAdditionRequestService.submitRequest(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Đã gửi yêu cầu thêm thực phẩm, vui lòng chờ admin duyệt", created));
    }

    // User xem trạng thái các yêu cầu của mình
    @GetMapping("/requests/my")
    public ResponseEntity<ApiResponse<List<FoodAdditionRequestResponse>>> getMyFoodRequests() {
        Integer userId = getCurrentUserId();
        List<FoodAdditionRequestResponse> requests = foodAdditionRequestService.getRequestsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    // Tính dinh dưỡng theo quantity
    @GetMapping("/{foodId}/nutrition")
    public ResponseEntity<ApiResponse<NutritionResponse>> calculateNutrition(
            @PathVariable Integer foodId,
            @RequestParam Float quantity) {
        NutritionResponse nutrition = foodService.calculateNutrition(foodId, quantity);
        return ResponseEntity.ok(ApiResponse.success(nutrition));
    }

    private Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new UnauthorizedException("Không xác định được người dùng");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Integer) {
            return (Integer) principal;
        }

        if (principal instanceof String principalText && principalText.matches("\\d+")) {
            return Integer.valueOf(principalText);
        }

        throw new UnauthorizedException("Không xác định được người dùng");
    }
}
