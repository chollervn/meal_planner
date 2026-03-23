package com.ronaldo.meal_planner_vip.controller;

import com.ronaldo.meal_planner_vip.dto.ApiResponse;
import com.ronaldo.meal_planner_vip.dto.LoginRequest;
import com.ronaldo.meal_planner_vip.dto.ResetPasswordRequest;
import com.ronaldo.meal_planner_vip.dto.UserResponse;
import com.ronaldo.meal_planner_vip.dto.UsersCreationRequest;
import com.ronaldo.meal_planner_vip.entity.Users;
import com.ronaldo.meal_planner_vip.security.JwtService;
import com.ronaldo.meal_planner_vip.service.AuthService;
import com.ronaldo.meal_planner_vip.service.UsersService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @Autowired
    private UsersService usersService;

    @Autowired
    private JwtService jwtService;

    // Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(@Valid @RequestBody LoginRequest request) {
        Users user = authService.authenticate(request);
        UserResponse userResponse = usersService.toUserResponse(user);
        userResponse.setAccessToken(jwtService.generateToken(user));
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công!", userResponse));
    }

    // Đăng ký
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody UsersCreationRequest request) {
        Users user = usersService.createUser(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công!", usersService.toUserResponse(user)));
    }

    // Đăng xuất (chỉ trả về message, session quản lý ở client)
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công!", null));
    }

    // Kiểm tra email tồn tại
    @GetMapping("/check_email")
    public ResponseEntity<ApiResponse<Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = authService.isEmailExists(email);
        return ResponseEntity.ok(ApiResponse.success(exists));
    }

    // Reset password bằng email cũ + mật khẩu mới
    @PostMapping("/reset_password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPasswordByEmail(request.getEmail(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công", null));
    }
}
