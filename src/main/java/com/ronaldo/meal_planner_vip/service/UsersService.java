package com.ronaldo.meal_planner_vip.service;

import com.ronaldo.meal_planner_vip.dto.UserUpdateRequest;
import com.ronaldo.meal_planner_vip.dto.UserResponse;
import com.ronaldo.meal_planner_vip.dto.UsersCreationRequest;
import com.ronaldo.meal_planner_vip.entity.Users;
import com.ronaldo.meal_planner_vip.exception.BadRequestException;
import com.ronaldo.meal_planner_vip.exception.ConflictException;
import com.ronaldo.meal_planner_vip.exception.ResourceNotFoundException;
import com.ronaldo.meal_planner_vip.exception.UnauthorizedException;
import com.ronaldo.meal_planner_vip.repository.ScheduleRepository;
import com.ronaldo.meal_planner_vip.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UsersService {
    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ScheduleRepository scheduleRepository;

    // Tạo user mới (đăng ký)
    public Users createUser(UsersCreationRequest request) {
        if (usersRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email đã tồn tại!");
        }

        Users user = new Users();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setUsername(request.getUsername());
        user.setAge(request.getAge());
        user.setHeightCm(request.getHeightCm());
        user.setWeightKg(request.getWeightKg());
        user.setBmi(calculateBMI(request.getHeightCm(), request.getWeightKg()));
        user.setRole("USER");

        return usersRepository.save(user);
    }

    // Lấy tất cả users
    public List<Users> getUsers() {
        return usersRepository.findAll();
    }

    // Lấy users cho trang quản lý admin
    public List<Users> getUsersForAdminManagement() {
        return usersRepository.findAll().stream()
                .filter(user -> !isAdmin(user))
                .collect(Collectors.toList());
    }

    // Lấy user theo ID
    public Users getUserById(Integer userId) {
        return usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + userId));
    }


    // Cập nhật thông tin user
    public Users updateUser(Integer userId, UserUpdateRequest request) {
        Users user = getUserById(userId);

        if (request.getUsername() != null) {
            user.setUsername(request.getUsername());
        }
        if (request.getAge() != null) {
            user.setAge(request.getAge());
        }
        if (request.getHeightCm() != null) {
            user.setHeightCm(request.getHeightCm());
        }
        if (request.getWeightKg() != null) {
            user.setWeightKg(request.getWeightKg());
        }
        if (request.getUserImage() != null) {
            user.setUserImage(request.getUserImage());
        }

        // Tính lại BMI
        user.setBmi(calculateBMI(user.getHeightCm(), user.getWeightKg()));

        return usersRepository.save(user);
    }

    public Users updateUserAvatar(Integer userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn ảnh");
        }

        String extension = resolveImageExtension(file);

        long maxSize = 5L * 1024 * 1024;
        if (file.getSize() > maxSize) {
            throw new BadRequestException("Kích thước ảnh tối đa 5MB");
        }

        Users user = getUserById(userId);

        try {
            Path uploadDir = Paths.get("uploads", "avatars").toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            String fileName = "user_" + userId + "_" + UUID.randomUUID().toString().replace("-", "") + extension;
            Path target = uploadDir.resolve(fileName);

            file.transferTo(target.toFile());

            user.setUserImage("/uploads/avatars/" + fileName);
            return usersRepository.save(user);
        } catch (Exception ex) {
            throw new BadRequestException("Không thể lưu ảnh, vui lòng thử lại");
        }
    }

    private String resolveImageExtension(MultipartFile file) {
        String contentType = String.valueOf(file.getContentType()).toLowerCase(Locale.ROOT);
        if ("image/jpeg".equals(contentType) || "image/jpg".equals(contentType) || "image/pjpeg".equals(contentType)) {
            return ".jpg";
        }
        if ("image/png".equals(contentType) || "image/x-png".equals(contentType)) {
            return ".png";
        }

        String fileName = String.valueOf(file.getOriginalFilename()).toLowerCase(Locale.ROOT);
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            return ".jpg";
        }
        if (fileName.endsWith(".png")) {
            return ".png";
        }

        throw new BadRequestException("Chỉ chấp nhận ảnh JPG hoặc PNG");
    }

    // Xóa user
    @Transactional
    public void deleteUser(Integer userId) {
        Users user = getUserById(userId);
        if (isAdmin(user)) {
            throw new BadRequestException("Không thể xóa tài khoản ADMIN");
        }

        scheduleRepository.findByUserUserId(userId).ifPresent(scheduleRepository::delete);
        usersRepository.delete(user);
    }

    // Đăng nhập
    public Users login(String email, String password) {
        Users user = usersRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("Email không tồn tại!");
        }
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new UnauthorizedException("Mật khẩu không đúng!");
        }
        return user;
    }

    // Tính BMI
    public Float calculateBMI(float heightCm, float weightKg) {
        if (heightCm <= 0 || weightKg <= 0) {
            return 0f;
        }
        float heightM = heightCm / 100;
        return weightKg / (heightM * heightM);
    }

    // Lấy BMI của user
    public Float getUserBMI(Integer userId) {
        Users user = getUserById(userId);
        return user.getBmi();
    }

    // Đếm tổng số users
    public long countUsers() {
        return usersRepository.count();
    }

    // Đếm tổng số users không bao gồm ADMIN
    public long countNonAdminUsers() {
        return usersRepository.findAll().stream().filter(user -> !isAdmin(user)).count();
    }

    private boolean isAdmin(Users user) {
        return user != null && "ADMIN".equalsIgnoreCase(String.valueOf(user.getRole()));
    }

    public UserResponse toUserResponse(Users user) {
        return new UserResponse(
                user.getUserId(),
                user.getEmail(),
                user.getUsername(),
                user.getAge(),
                user.getHeightCm(),
                user.getWeightKg(),
                user.getBmi(),
                user.getUserImage(),
                user.getRole()
        );
    }

    public List<UserResponse> toUserResponses(List<Users> users) {
        return users.stream().map(this::toUserResponse).collect(Collectors.toList());
    }
}
