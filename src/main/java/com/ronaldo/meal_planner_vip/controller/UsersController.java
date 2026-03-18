package com.ronaldo.meal_planner_vip.controller;

import com.ronaldo.meal_planner_vip.dto.ApiResponse;
import com.ronaldo.meal_planner_vip.dto.UserResponse;
import com.ronaldo.meal_planner_vip.dto.UserUpdateRequest;
import com.ronaldo.meal_planner_vip.dto.UsersCreationRequest;
import com.ronaldo.meal_planner_vip.entity.Users;
import com.ronaldo.meal_planner_vip.service.UsersService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UsersController {
    @Autowired
    private UsersService usersService;

    // Tạo user mới
    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UsersCreationRequest request) {
        Users user = usersService.createUser(request);
        return ResponseEntity.ok(ApiResponse.success("Tạo user thành công!", usersService.toUserResponse(user)));
    }

    // Lấy tất cả users
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsers() {
        List<Users> users = usersService.getUsers();
        return ResponseEntity.ok(ApiResponse.success(usersService.toUserResponses(users)));
    }

    // Lấy user theo ID
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Integer userId) {
        Users user = usersService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(usersService.toUserResponse(user)));
    }

    // Lấy profile (thông tin cá nhân)
    @GetMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(@PathVariable Integer userId) {
        Users user = usersService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(usersService.toUserResponse(user)));
    }

    // Cập nhật thông tin user
    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Integer userId,
            @Valid @RequestBody UserUpdateRequest request) {
        Users user = usersService.updateUser(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công!", usersService.toUserResponse(user)));
    }

    // Xóa user
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Integer userId) {
        usersService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Xóa user thành công!", null));
    }

    // Lấy BMI của user
    @GetMapping("/{userId}/bmi")
    public ResponseEntity<ApiResponse<Float>> getUserBMI(@PathVariable Integer userId) {
        Float bmi = usersService.getUserBMI(userId);
        return ResponseEntity.ok(ApiResponse.success(bmi));
    }

    // Tính BMI (không cần user, chỉ cần height và weight)
    @GetMapping("/calculate-bmi")
    public ResponseEntity<ApiResponse<Float>> calculateBMI(
            @RequestParam float heightCm,
            @RequestParam float weightKg) {
        Float bmi = usersService.calculateBMI(heightCm, weightKg);
        return ResponseEntity.ok(ApiResponse.success(bmi));
    }

    // Đếm tổng số users (cho admin)
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> countUsers() {
        long count = usersService.countUsers();
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
