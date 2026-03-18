package com.ronaldo.meal_planner_vip.controller;

import com.ronaldo.meal_planner_vip.dto.ApiResponse;
import com.ronaldo.meal_planner_vip.dto.UserResponse;
import com.ronaldo.meal_planner_vip.entity.Users;
import com.ronaldo.meal_planner_vip.service.ScheduleService;
import com.ronaldo.meal_planner_vip.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    private UsersService usersService;

    @Autowired
    private ScheduleService scheduleService;

    // Lấy danh sách tất cả users
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<Users> users = usersService.getUsersForAdminManagement();
        return ResponseEntity.ok(ApiResponse.success(usersService.toUserResponses(users)));
    }

    // Lấy thông tin chi tiết của một user
    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserDetail(@PathVariable Integer userId) {
        Users user = usersService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(usersService.toUserResponse(user)));
    }

    // Xóa user
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Integer userId) {
        usersService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Xóa user thành công!", null));
    }

    // Thống kê tổng quan
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();

        // Tổng số users
        stats.put("totalUsers", usersService.countNonAdminUsers());

        // Tổng lượt áp thực đơn
        stats.put("totalAppliedMeals", scheduleService.countAppliedMeals());

        // Người dùng hoạt động tuần này
        stats.put("activeUsersThisWeek", scheduleService.countActiveUsersThisWeek());

        // Thực đơn được sử dụng nhiều nhất
        stats.put("mostUsedMeals", scheduleService.getMostUsedMealsWithName());

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // Thống kê thực đơn được sử dụng nhiều nhất
    @GetMapping("/stats/meals")
    public ResponseEntity<ApiResponse<List<Object[]>>> getMostUsedMeals() {
        List<Object[]> stats = scheduleService.getMostUsedMealsWithName();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // Đếm tổng số users
    @GetMapping("/stats/users/count")
    public ResponseEntity<ApiResponse<Long>> countUsers() {
        long count = usersService.countNonAdminUsers();
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
