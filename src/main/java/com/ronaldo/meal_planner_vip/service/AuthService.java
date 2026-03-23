package com.ronaldo.meal_planner_vip.service;

import com.ronaldo.meal_planner_vip.dto.LoginRequest;
import com.ronaldo.meal_planner_vip.entity.Users;
import com.ronaldo.meal_planner_vip.exception.ResourceNotFoundException;
import com.ronaldo.meal_planner_vip.exception.UnauthorizedException;
import com.ronaldo.meal_planner_vip.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Xác thực đăng nhập
    public Users authenticate(String email, String password) {
        Users user = usersRepository.findByEmail(email);

        if (user == null) {
            throw new ResourceNotFoundException("Email không tồn tại!");
        }

        if (!isPasswordValid(password, user)) {
            throw new UnauthorizedException("Mật khẩu không đúng!");
        }

        return user;
    }

    // Xác thực từ request
    public Users authenticate(LoginRequest request) {
        return authenticate(request.getEmail(), request.getPassword());
    }

    // Kiểm tra email tồn tại
    public boolean isEmailExists(String email) {
        return usersRepository.existsByEmail(email);
    }

    public void resetPasswordByEmail(String email, String newPassword) {
        Users user = usersRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("Email không tồn tại!");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        usersRepository.save(user);
    }

    // Kiểm tra user có phải admin không
    public boolean isAdmin(Integer userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại!"));
        return "ADMIN".equals(user.getRole());
    }

    private boolean isPasswordValid(String rawPassword, Users user) {
        String storedPassword = user.getPassword();
        if (storedPassword == null || storedPassword.isBlank()) {
            return false;
        }

        if (isBcryptHash(storedPassword)) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }

        if (!rawPassword.equals(storedPassword)) {
            return false;
        }

        user.setPassword(passwordEncoder.encode(rawPassword));
        usersRepository.save(user);
        return true;
    }

    private boolean isBcryptHash(String value) {
        return value.matches("^\\$2[aby]\\$.{56}$");
    }
}
