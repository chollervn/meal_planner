package com.ronaldo.meal_planner_vip.controller;

import com.ronaldo.meal_planner_vip.dto.ApiResponse;
import com.ronaldo.meal_planner_vip.dto.FoodUsageStatsPageResponse;
import com.ronaldo.meal_planner_vip.dto.FoodAdditionRequestResponse;
import com.ronaldo.meal_planner_vip.dto.UserResponse;
import com.ronaldo.meal_planner_vip.entity.Users;
import com.ronaldo.meal_planner_vip.exception.UnauthorizedException;
import com.ronaldo.meal_planner_vip.service.FoodAdditionRequestService;
import com.ronaldo.meal_planner_vip.service.ScheduleService;
import com.ronaldo.meal_planner_vip.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @Autowired
    private FoodAdditionRequestService foodAdditionRequestService;

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

    @GetMapping("/stats/foods")
    public ResponseEntity<ApiResponse<FoodUsageStatsPageResponse>> getMostUsedFoods(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "3") Integer mealLimit) {
        int safePage = Math.max(page == null ? 1 : page, 1);
        int safePageSize = Math.min(Math.max(pageSize == null ? 10 : pageSize, 1), 10);
        int safeMealLimit = Math.min(Math.max(mealLimit == null ? 3 : mealLimit, 1), 10);
        FoodUsageStatsPageResponse stats = scheduleService.getTopUsedFoodsWithTopMeals(safePage, safePageSize, safeMealLimit);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // Đếm tổng số users
    @GetMapping("/stats/users/count")
    public ResponseEntity<ApiResponse<Long>> countUsers() {
        long count = usersService.countNonAdminUsers();
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/food-requests")
    public ResponseEntity<ApiResponse<List<FoodAdditionRequestResponse>>> getFoodRequests(
            @RequestParam(required = false) String status) {
        List<FoodAdditionRequestResponse> requests = foodAdditionRequestService.getRequestsForAdmin(status);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @PostMapping("/food-requests/{requestId}/approve")
    public ResponseEntity<ApiResponse<FoodAdditionRequestResponse>> approveFoodRequest(@PathVariable Integer requestId) {
        Integer adminUserId = getCurrentUserId();
        FoodAdditionRequestResponse result = foodAdditionRequestService.approveRequest(requestId, adminUserId);
        return ResponseEntity.ok(ApiResponse.success("Đã duyệt yêu cầu thêm thực phẩm", result));
    }

    @PostMapping("/food-requests/{requestId}/reject")
    public ResponseEntity<ApiResponse<FoodAdditionRequestResponse>> rejectFoodRequest(@PathVariable Integer requestId) {
        Integer adminUserId = getCurrentUserId();
        FoodAdditionRequestResponse result = foodAdditionRequestService.rejectRequest(requestId, adminUserId);
        return ResponseEntity.ok(ApiResponse.success("Đã từ chối yêu cầu thêm thực phẩm", result));
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
